import { describe, expect, it } from 'vitest';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

describe('reverse', () => {
    it('substitutes params into a pattern', () => {
        expect(reverse('/papers/:resourceId', { resourceId: 'R123' })).toBe('/papers/R123');
    });

    it('returns the pattern unchanged when compilation fails', () => {
        expect(reverse('/papers/:resourceId')).toBe('/papers/:resourceId');
    });
});

describe('ROUTES', () => {
    // Next's default `trailingSlash: false` 308-redirects `/foo/` to `/foo`, so a pattern ending in a
    // slash makes every link built from it hit a redirect — and makes any canonical built from it point
    // at a non-200 URL. `HOME` is the only legitimate bare slash.
    it('has no pattern with a trailing slash', () => {
        const offenders = Object.entries(ROUTES).filter(([, pattern]) => pattern !== '/' && pattern.endsWith('/'));
        expect(offenders).toEqual([]);
    });

    it('builds the comparison canonical without a trailing slash', () => {
        expect(reverse(ROUTES.COMPARISON, { comparisonId: 'R123' })).toBe('/comparisons/R123');
    });
});
