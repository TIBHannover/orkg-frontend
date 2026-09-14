import { ComparisonPath, ComparisonUpdateSelectedPath } from '@/services/backend/types';

/**
 * Minimal shape of a node in a selectable path tree. Richer nodes (labels, expansion flags, …)
 * round-trip through the helpers unchanged thanks to the self-referential generic parameter.
 */
export type SelectablePathNode<T> = {
    id: string;
    type: ComparisonPath['type'];
    isSelected?: boolean;
    children?: T[];
};

/** The bare node type, used when no richer tree (labels, expansion flags, …) is at hand. */
export type SelectablePath = {
    id: string;
    type: ComparisonPath['type'];
    isSelected?: boolean;
    children: SelectablePath[];
};

/** Returns the node at `targetPath`, or `undefined` when any segment is missing. */
export const findPathNode = <T extends SelectablePathNode<T>>(paths: T[], targetPath: string[]): T | undefined => {
    if (targetPath.length === 0) {
        return undefined;
    }
    const [head, ...rest] = targetPath;
    const node = paths.find((path) => path.id === head);
    if (!node || rest.length === 0) {
        return node;
    }
    return findPathNode(node.children ?? [], rest);
};

/** Applies `update` to the node at `targetPath`; a no-op when any segment is missing. */
export const updatePathNode = <T extends SelectablePathNode<T>>(paths: T[], targetPath: string[], update: (node: T) => T): T[] => {
    if (targetPath.length === 0) {
        return paths;
    }
    const [head, ...rest] = targetPath;
    return paths.map((path) => {
        if (path.id !== head) {
            return path;
        }
        if (rest.length === 0) {
            return update(path);
        }
        return path.children ? { ...path, children: updatePathNode(path.children, rest, update) } : path;
    });
};

/**
 * Selects the node at `targetPath` together with every ancestor on the way: a child is only
 * reachable through a selected parent. Missing segments are created with `createNode` when given,
 * otherwise the call is a no-op.
 */
export const selectPath = <T extends SelectablePathNode<T>>(paths: T[], targetPath: string[], createNode?: (id: string) => T): T[] => {
    if (targetPath.length === 0 || (!createNode && !findPathNode(paths, targetPath))) {
        return paths;
    }
    const [head, ...rest] = targetPath;
    const select = (node: T): T => ({ ...node, isSelected: true, children: selectPath(node.children ?? [], rest, createNode) });
    if (paths.some((path) => path.id === head)) {
        return paths.map((path) => (path.id === head ? select(path) : path));
    }
    return createNode ? [...paths, select(createNode(head))] : paths;
};

const deselectSubtree = <T extends SelectablePathNode<T>>(node: T): T => ({
    ...node,
    isSelected: false,
    children: node.children?.map(deselectSubtree),
});

/** Deselects the node at `targetPath` and its whole subtree; ancestors keep their selection. */
export const deselectPath = <T extends SelectablePathNode<T>>(paths: T[], targetPath: string[]): T[] =>
    updatePathNode(paths, targetPath, deselectSubtree);

/** Flips the selection of the node at `targetPath` (see `selectPath` / `deselectPath` for the side effects). */
export const toggleSelectPath = <T extends SelectablePathNode<T>>(paths: T[], targetPath: string[]): T[] =>
    findPathNode(paths, targetPath)?.isSelected ? deselectPath(paths, targetPath) : selectPath(paths, targetPath);

/** Lifts the backend's `selected_paths` (every node present is selected) into a selectable tree. */
export const toSelectableTree = (paths: ComparisonPath[]): SelectablePath[] =>
    paths.map(({ id, type, children }) => ({ id, type, isSelected: true, children: toSelectableTree(children ?? []) }));

/** Projects the selected nodes of a tree onto the `selected_paths` update payload (unselected subtrees are dropped). */
export const toUpdatePaths = <T extends SelectablePathNode<T>>(paths: T[]): ComparisonUpdateSelectedPath[] =>
    paths.filter((path) => path.isSelected).map(({ id, type, children }) => ({ id, type, children: children ? toUpdatePaths(children) : [] }));
