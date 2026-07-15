import { computeUpdatedHistory, expandPath, History, matchesEntry, schemaHistory } from '@/components/DataBrowser/hooks/useHistory';

/**
 * Contract tests for the `?history=` entry logic ({s, p, r} entries — see the
 * schema doc in DataBrowserTypes.ts). These pure functions drive which dialogs
 * are open, in-dialog navigation, and the parent-crumb promotion; regressions
 * here silently orphan or cross-wire dialog state in shareable URLs.
 */

describe('matchesEntry', () => {
    it('matches any scope when the entry has no scope (legacy URLs)', () => {
        expect(matchesEntry({ p: ['C1', 'P1', 'R1'] }, 'S1', ['C1'])).toBe(true);
        expect(matchesEntry({ p: ['C1'] }, undefined, ['C1'])).toBe(true);
    });

    it('rejects a different scope', () => {
        expect(matchesEntry({ s: 'S2', p: ['C1'] }, 'S1', ['C1'])).toBe(false);
    });

    it('rejects when the root-prefix length does not equal r (both directions)', () => {
        // r absent = 1: a contribution-dialog entry never matches a cell prefix...
        expect(matchesEntry({ s: 'S1', p: ['C1', 'P1', 'R1'] }, 'S1', ['C1', 'P1', 'R1'])).toBe(false);
        // ...and a cell entry (r=3) never matches a contribution-dialog prefix
        expect(matchesEntry({ s: 'S1', p: ['C1', 'P1', 'R1'], r: 3 }, 'S1', ['C1'])).toBe(false);
    });

    it('rejects when p is shorter than the root prefix or diverges from it', () => {
        expect(matchesEntry({ s: 'S1', p: ['C1', 'P1'], r: 3 }, 'S1', ['C1', 'P1', 'R1'])).toBe(false);
        expect(matchesEntry({ s: 'S1', p: ['C1', 'P1', 'OTHER'], r: 3 }, 'S1', ['C1', 'P1', 'R1'])).toBe(false);
    });

    it('matches an entry navigated deeper than the root prefix', () => {
        expect(matchesEntry({ s: 'S1', p: ['C1', 'P1', 'R1', 'P2', 'R2'], r: 3 }, 'S1', ['C1', 'P1', 'R1'])).toBe(true);
    });
});

describe('computeUpdatedHistory — unscoped (standalone browsers)', () => {
    it('replaces the entry path when navigating deeper', () => {
        const prev: History = [{ p: ['R1', 'P1', 'R2'] }];
        expect(computeUpdatedHistory(prev, ['R1', 'P1', 'R2', 'P2', 'R3'], undefined, ['R1'])).toEqual([{ p: ['R1', 'P1', 'R2', 'P2', 'R3'] }]);
    });

    it('removes the entry when collapsing back to the root', () => {
        const prev: History = [{ p: ['R1', 'P1', 'R2'] }];
        expect(computeUpdatedHistory(prev, ['R1'], undefined, ['R1'])).toEqual([]);
    });

    it('pushes a missing entry only when the path is longer than the root', () => {
        expect(computeUpdatedHistory([], ['R1', 'P1', 'R2'], undefined, ['R1'])).toEqual([{ p: ['R1', 'P1', 'R2'] }]);
        expect(computeUpdatedHistory([], ['R1'], undefined, ['R1'])).toEqual([]);
    });

    it('clamps a path that does not start at the root back to the root', () => {
        const prev: History = [{ p: ['R1', 'P1', 'R2'] }];
        expect(computeUpdatedHistory(prev, ['X', 'P9', 'Y'], undefined, ['R1'])).toEqual([]);
    });
});

describe('computeUpdatedHistory — scoped contribution dialog (r=1)', () => {
    it('pushes an entry at the bare root (presence = dialog open)', () => {
        expect(computeUpdatedHistory([], ['C1'], 'S1', ['C1'])).toEqual([{ s: 'S1', p: ['C1'] }]);
    });

    it('keeps the entry when navigating back to the root instead of removing it', () => {
        const prev: History = [{ s: 'S1', p: ['C1', 'P1', 'R1'] }];
        expect(computeUpdatedHistory(prev, ['C1'], 'S1', ['C1'])).toEqual([{ s: 'S1', p: ['C1'] }]);
    });

    it('replaces the entry path when navigating deeper', () => {
        const prev: History = [{ s: 'S1', p: ['C1'] }];
        expect(computeUpdatedHistory(prev, ['C1', 'P1', 'R1'], 'S1', ['C1'])).toEqual([{ s: 'S1', p: ['C1', 'P1', 'R1'] }]);
    });
});

describe('computeUpdatedHistory — scoped cell dialog (r=3)', () => {
    const cellPrefix = ['C1', 'P1', 'R1'];

    it('extends the tail keeping s and r', () => {
        const prev: History = [{ s: 'S1', p: cellPrefix, r: 3 }];
        expect(computeUpdatedHistory(prev, ['C1', 'P1', 'R1', 'P2', 'R2'], 'S1', cellPrefix)).toEqual([
            { s: 'S1', p: ['C1', 'P1', 'R1', 'P2', 'R2'], r: 3 },
        ]);
    });

    it('clamps a diverging path to the floor and never removes the floor entry', () => {
        const prev: History = [{ s: 'S1', p: ['C1', 'P1', 'R1', 'P2', 'R2'], r: 3 }];
        expect(computeUpdatedHistory(prev, ['X'], 'S1', cellPrefix)).toEqual([{ s: 'S1', p: cellPrefix, r: 3 }]);
        expect(computeUpdatedHistory(prev, cellPrefix, 'S1', cellPrefix)).toEqual([{ s: 'S1', p: cellPrefix, r: 3 }]);
    });

    it('promotes navigation above the floor into the parent r=1 scope (own entry removed)', () => {
        const prev: History = [{ s: 'S1', p: ['C1', 'P1', 'R1', 'P2', 'R2'], r: 3 }];
        expect(computeUpdatedHistory(prev, ['C1'], 'S1', cellPrefix)).toEqual([{ s: 'S1', p: ['C1'] }]);
    });

    it('promotion replaces an already-open parent dialog entry instead of duplicating it', () => {
        const prev: History = [
            { s: 'S1', p: ['C1', 'P9', 'R9'] },
            { s: 'S1', p: cellPrefix, r: 3 },
        ];
        expect(computeUpdatedHistory(prev, ['C1'], 'S1', cellPrefix)).toEqual([{ s: 'S1', p: ['C1'] }]);
    });

    it('promotes intermediate parent levels from a nested sub-row prefix (r=5)', () => {
        const nestedPrefix = ['C1', 'P1', 'R1', 'P2', 'R2'];
        const prev: History = [{ s: 'S1', p: nestedPrefix, r: 5 }];
        expect(computeUpdatedHistory(prev, ['C1', 'P1', 'R1'], 'S1', nestedPrefix)).toEqual([{ s: 'S1', p: ['C1', 'P1', 'R1'] }]);
    });

    it('does not promote without a scope — the shorter path clamps to the floor', () => {
        const prev: History = [];
        expect(computeUpdatedHistory(prev, ['C1'], undefined, cellPrefix)).toEqual([{ p: cellPrefix, r: 3 }]);
    });

    it('only touches the matching entry in multi-entry arrays', () => {
        const foreign = { s: 'S2', p: ['C1', 'P1', 'R1'], r: 3 };
        const legacyDeep = { p: ['Z1', 'P5', 'Z2'] };
        const prev: History = [foreign, legacyDeep, { s: 'S1', p: cellPrefix, r: 3 }];
        expect(computeUpdatedHistory(prev, ['C1', 'P1', 'R1', 'P2', 'R2'], 'S1', cellPrefix)).toEqual([
            foreign,
            legacyDeep,
            { s: 'S1', p: ['C1', 'P1', 'R1', 'P2', 'R2'], r: 3 },
        ]);
    });
});

describe('expandPath', () => {
    it('passes absolute paths through (breadcrumb targets anchored at the root)', () => {
        expect(expandPath(['A', 'p1', 'B'], ['A'])).toEqual(['A']);
        expect(expandPath(['A', 'p1', 'B', 'p2', 'C'], ['A', 'p1', 'B'])).toEqual(['A', 'p1', 'B']);
    });

    it('re-anchors statement paths seeded at the currently viewed entity', () => {
        expect(expandPath(['A', 'p1', 'B'], ['B', 'p2', 'C'])).toEqual(['A', 'p1', 'B', 'p2', 'C']);
    });

    it('passes through when the path start is unknown or empty', () => {
        expect(expandPath(['A', 'p1', 'B'], ['X', 'p9', 'Y'])).toEqual(['X', 'p9', 'Y']);
        expect(expandPath(['A', 'p1', 'B'], [])).toEqual([]);
    });

    it('keeps cyclic paths intact by anchoring on the current entity, not its first occurrence', () => {
        expect(expandPath(['A', 'p1', 'B', 'p2', 'A'], ['A', 'p3', 'D'])).toEqual(['A', 'p1', 'B', 'p2', 'A', 'p3', 'D']);
    });

    it('passes a bare root target through even when the current entity equals the root (cycle)', () => {
        expect(expandPath(['A', 'p1', 'B', 'p2', 'A'], ['A'])).toEqual(['A']);
    });
});

describe('schemaHistory', () => {
    it('drops invalid entries individually instead of failing the whole array', () => {
        expect(schemaHistory.parse([{ p: 'not-an-array' }, { s: 'S1', p: ['C1'], r: 0 }, { p: ['R1', 'P1', 'R2'] }, { s: 'S1', p: ['C1'] }])).toEqual(
            [{ p: ['R1', 'P1', 'R2'] }, { s: 'S1', p: ['C1'] }],
        );
    });

    it('throws on non-array input so nuqs falls back to the default', () => {
        expect(() => schemaHistory.parse('nope')).toThrow();
    });
});
