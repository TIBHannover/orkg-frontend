import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { attachClosestEdge, type Edge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';

// ====================
// Core Types
// ====================

export type DragData<T = unknown> = {
    [key: symbol]: true;
    item: T;
    index: number;
    instanceId: symbol;
};

export type ReorderParams = {
    startIndex: number;
    indexOfTarget: number;
    closestEdgeOfTarget: Edge | null;
};

export type DragHandleProps = {
    role: string;
    tabIndex: number;
    'aria-label': string;
};

export type DragState = {
    isDragging: boolean;
    closestEdge: Edge | null;
};

export type EdgeChangeHandler = (params: { source: { element: HTMLElement }; self: { data: any } }) => void;

// ====================
// Factory Functions
// ====================

export const createDragDataKey = (name: string) => Symbol(name);

export function createDragDataFactory<T>(key: symbol) {
    return ({ item, index, instanceId }: { item: T; index: number; instanceId: symbol }): DragData<T> => ({
        [key]: true,
        item,
        index,
        instanceId,
    });
}

export function createDragDataValidator<T>(key: symbol) {
    return (data: Record<string | symbol, unknown>): data is DragData<T> => {
        return data[key] === true;
    };
}

export const createInstanceId = (name: string) => Symbol(`${name}-instance`);

// ====================
// Default Props
// ====================

export const defaultDragHandleProps: DragHandleProps = {
    role: 'button',
    tabIndex: 0,
    'aria-label': 'Drag handle',
};

// ====================
// Drag and Drop Hooks
// ====================

export type UseDraggableItemConfig<T> = {
    element: HTMLElement | null;
    dragHandle?: HTMLElement | null;
    item: T;
    index: number;
    instanceId: symbol;
    createDragData: (params: { item: T; index: number; instanceId: symbol }) => DragData<T>;
    isDragData: (data: Record<string | symbol, unknown>) => data is DragData<T>;
    onDragStart?: () => void;
    onDrop?: () => void;
    allowedEdges?: Edge[];
    onEdgeChange?: EdgeChangeHandler;
    onDragEnter?: EdgeChangeHandler;
    onDragLeave?: () => void;
    canDrop?: (params: { source: DragData<T>; target: DragData<T> }) => boolean;
};

export function createDraggableItem<T>({
    element,
    dragHandle,
    item,
    index,
    instanceId,
    createDragData,
    isDragData,
    onDragStart,
    onDrop,
    allowedEdges = ['top', 'bottom'],
    onEdgeChange,
    onDragEnter,
    onDragLeave,
    canDrop,
}: UseDraggableItemConfig<T>) {
    if (!element) {
        return undefined;
    }

    const data = createDragData({ item, index, instanceId });

    return combine(
        draggable({
            element,
            dragHandle: dragHandle || undefined,
            getInitialData: () => data,
            onDragStart() {
                onDragStart?.();
            },
            onDrop() {
                onDrop?.();
            },
        }),
        dropTargetForElements({
            element,
            canDrop({ source }) {
                if (!isDragData(source.data) || source.data.instanceId !== instanceId) {
                    return false;
                }

                // If custom canDrop function is provided, use it
                if (canDrop) {
                    return canDrop({ source: source.data, target: data });
                }

                return true;
            },
            getData({ input }) {
                return attachClosestEdge(data, {
                    element,
                    input,
                    allowedEdges,
                });
            },
            onDragEnter: onDragEnter || onEdgeChange,
            onDrag: onEdgeChange,
            onDragLeave() {
                onDragLeave?.();
            },
            onDrop() {
                onDragLeave?.();
            },
        }),
    );
}

export type UseListMonitorConfig<T> = {
    instanceId: symbol;
    items: T[];
    isDragData: (data: Record<string | symbol, unknown>) => data is DragData<T>;
    onReorder: (params: ReorderParams) => void;
    getItemId: (item: T) => string;
};

export function createListMonitor<T>({ instanceId, items, isDragData, onReorder, getItemId }: UseListMonitorConfig<T>) {
    return monitorForElements({
        canMonitor({ source }) {
            return isDragData(source.data) && source.data.instanceId === instanceId;
        },
        onDrop({ location, source }) {
            const target = location.current.dropTargets[0];
            if (!target) {
                return;
            }

            const sourceData = source.data;
            const targetData = target.data;

            if (!isDragData(sourceData) || !isDragData(targetData)) {
                return;
            }

            const indexOfTarget = items.findIndex((item) => getItemId(item) === getItemId(targetData.item));
            if (indexOfTarget < 0) {
                return;
            }

            const closestEdgeOfTarget = extractClosestEdge(targetData);

            onReorder({
                startIndex: sourceData.index,
                indexOfTarget,
                closestEdgeOfTarget,
            });
        },
    });
}

// ====================
// Reorder Utilities
// ====================

export function performReorder<T>({
    items,
    startIndex,
    indexOfTarget,
    closestEdgeOfTarget,
    axis = 'vertical',
}: {
    items: T[];
    startIndex: number;
    indexOfTarget: number;
    closestEdgeOfTarget: Edge | null;
    axis?: 'vertical' | 'horizontal';
}): T[] {
    const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis,
    });

    if (finishIndex === startIndex) {
        return items;
    }

    return reorder({
        list: items,
        startIndex,
        finishIndex,
    });
}

// ====================
// Edge and Drop Indicator Utilities
// ====================

export function createEdgeChangeHandler({
    targetElement,
    sourceIndex,
    targetIndex,
    setClosestEdge,
}: {
    targetElement: HTMLElement;
    sourceIndex: number;
    targetIndex: number;
    setClosestEdge: (edge: Edge | null) => void;
}): EdgeChangeHandler {
    return function onChange({ source, self }) {
        const isSource = source.element === targetElement;
        if (isSource) {
            setClosestEdge(null);
            return;
        }

        const currentClosestEdge = extractClosestEdge(self.data);

        const isItemBeforeSource = targetIndex === sourceIndex - 1;
        const isItemAfterSource = targetIndex === sourceIndex + 1;

        const isDropIndicatorHidden = (isItemBeforeSource && currentClosestEdge === 'bottom') || (isItemAfterSource && currentClosestEdge === 'top');

        if (isDropIndicatorHidden) {
            setClosestEdge(null);
            return;
        }

        setClosestEdge(currentClosestEdge);
    };
}

export function shouldHideDropIndicator(closestEdge: Edge | null, sourceIndex: number, targetIndex: number): boolean {
    const isItemBeforeSource = targetIndex === sourceIndex - 1;
    const isItemAfterSource = targetIndex === sourceIndex + 1;

    return (isItemBeforeSource && closestEdge === 'bottom') || (isItemAfterSource && closestEdge === 'top');
}
