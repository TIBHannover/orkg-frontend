import { describe, expect, it } from 'vitest';

import {
    deselectPath,
    findPathNode,
    SelectablePath,
    selectPath,
    toggleSelectPath,
    toSelectableTree,
    toUpdatePaths,
    updatePathNode,
} from '@/components/Comparison/utils/pathTree';
import { ComparisonPath, ComparisonUpdateSelectedPath } from '@/services/backend/types';

const path = (id: string, children: ComparisonPath[] = []): ComparisonPath => ({
    id,
    label: id,
    description: null,
    type: 'PREDICATE',
    children,
});

const node = (id: string, isSelected: boolean, children: SelectablePath[] = []): SelectablePath => ({
    id,
    type: 'PREDICATE',
    isSelected,
    children,
});

const on = (id: string, children: SelectablePath[] = []) => node(id, true, children);
const off = (id: string, children: SelectablePath[] = []) => node(id, false, children);

const updatePath = (id: string, children: ComparisonUpdateSelectedPath[] = []): ComparisonUpdateSelectedPath => ({
    id,
    type: 'PREDICATE',
    children,
});

const createNode = (id: string): SelectablePath => ({ id, type: 'PREDICATE', isSelected: true, children: [] });

describe('findPathNode', () => {
    it('resolves nested targets and returns undefined for missing segments', () => {
        const tree = [on('A', [off('B')])];
        expect(findPathNode(tree, ['A', 'B'])).toEqual(off('B'));
        expect(findPathNode(tree, ['A', 'Z'])).toBeUndefined();
        expect(findPathNode(tree, [])).toBeUndefined();
    });
});

describe('updatePathNode', () => {
    it('applies the update to the target only, preserving extra node fields', () => {
        type Node = SelectablePath & { isExpanded?: boolean; children: Node[] };
        const tree: Node[] = [{ ...on('A'), children: [{ ...off('B'), children: [] }] }, { ...off('C'), children: [] }];
        const result = updatePathNode(tree, ['A', 'B'], (n) => ({ ...n, isExpanded: true }));
        expect(result[0].children[0].isExpanded).toBe(true);
        expect(result[0].isExpanded).toBeUndefined();
        expect(result[1]).toBe(tree[1]);
    });

    it('is a no-op when the target does not exist', () => {
        const tree = [on('A')];
        expect(updatePathNode(tree, ['Z'], (n) => ({ ...n, isSelected: false }))).toEqual(tree);
    });
});

describe('selectPath', () => {
    it('selects the target and every ancestor on the way', () => {
        const tree = [off('A', [off('B', [off('C')]), off('D')])];
        expect(selectPath(tree, ['A', 'B', 'C'])).toEqual([on('A', [on('B', [on('C')]), off('D')])]);
    });

    it('does not touch siblings or descendants of the target', () => {
        const tree = [off('A', [off('B')]), off('C')];
        expect(selectPath(tree, ['A'])).toEqual([on('A', [off('B')]), off('C')]);
    });

    it('is a no-op for a missing target when no createNode is given', () => {
        const tree = [off('A')];
        expect(selectPath(tree, ['A', 'B'])).toEqual(tree);
        expect(selectPath(tree, ['Z'])).toEqual(tree);
        expect(selectPath(tree, [])).toEqual(tree);
    });

    it('creates the missing chain with createNode', () => {
        expect(selectPath([], ['A', 'B', 'C'], createNode)).toEqual([on('A', [on('B', [on('C')])])]);
    });

    it('extends an existing branch instead of duplicating it, leaving siblings alone', () => {
        const tree = [on('A'), on('X')];
        expect(selectPath(tree, ['A', 'B'], createNode)).toEqual([on('A', [on('B')]), on('X')]);
    });
});

describe('deselectPath', () => {
    it('deselects the target and its whole subtree, keeping ancestors selected', () => {
        const tree = [on('A', [on('B', [on('C')]), on('D')])];
        expect(deselectPath(tree, ['A', 'B'])).toEqual([on('A', [off('B', [off('C')]), on('D')])]);
    });

    it('is a no-op when the target does not exist', () => {
        const tree = [on('A')];
        expect(deselectPath(tree, ['Z'])).toEqual(tree);
    });
});

describe('toggleSelectPath', () => {
    it('selects an unselected node (and its ancestors)', () => {
        expect(toggleSelectPath([off('A', [off('B')])], ['A', 'B'])).toEqual([on('A', [on('B')])]);
    });

    it('deselects a selected node together with its subtree', () => {
        expect(toggleSelectPath([on('A', [on('B')])], ['A'])).toEqual([off('A', [off('B')])]);
    });

    it('treats a node without an explicit isSelected flag as unselected', () => {
        const tree: SelectablePath[] = [{ id: 'A', type: 'PREDICATE', children: [] }];
        expect(toggleSelectPath(tree, ['A'])).toEqual([on('A')]);
    });
});

describe('toSelectableTree', () => {
    it('marks every node selected and strips label/description/sources', () => {
        expect(toSelectableTree([path('A', [path('B')]), path('C')])).toEqual([on('A', [on('B')]), on('C')]);
    });
});

describe('toUpdatePaths', () => {
    it('keeps only selected nodes and drops unselected subtrees', () => {
        const tree = [on('A', [off('B', [on('C')]), on('D')]), off('E')];
        expect(toUpdatePaths(tree)).toEqual([updatePath('A', [updatePath('D')])]);
    });

    it('returns an empty children array when children is missing on a node', () => {
        expect(toUpdatePaths([{ id: 'A', type: 'PREDICATE', isSelected: true }])).toEqual([updatePath('A')]);
    });

    it('round-trips the backend selected_paths through toSelectableTree unchanged', () => {
        const input = [path('A', [path('B')]), path('C')];
        expect(toUpdatePaths(toSelectableTree(input))).toEqual([updatePath('A', [updatePath('B')]), updatePath('C')]);
    });

    it('composes with selectPath/deselectPath the way the visibility toggle does', () => {
        const current = toSelectableTree([path('A', [path('B')])]);
        expect(toUpdatePaths(selectPath(current, ['A', 'C'], createNode))).toEqual([updatePath('A', [updatePath('B'), updatePath('C')])]);
        expect(toUpdatePaths(deselectPath(current, ['A', 'B']))).toEqual([updatePath('A')]);
        expect(toUpdatePaths(deselectPath(current, ['A']))).toEqual([]);
    });
});
