# Shared Drag and Drop Utilities

This directory contains reusable components and utilities for implementing drag and drop functionality using `@atlaskit/pragmatic-drag-and-drop`.

## Components

### SortableSection

A reusable section component with built-in drag handle, delete button, and manual sort buttons.

**Usage:**

```tsx
import SortableSection from '@/components/shared/SortableSection/SortableSection';

<SortableSection handleDelete={() => deleteItem(id)} handleSort={(direction) => moveItem(id, direction)} dragHandleRef={setDragHandleElement}>
    {/* Your content here */}
</SortableSection>;
```

## Utilities (dragAndDropUtils.ts)

### Core Factory Functions

#### `createDragDataKey(name: string)`

Creates a unique symbol for identifying drag data types.

#### `createDragDataFactory<T>(key: symbol)`

Creates a factory function for generating type-safe drag data.

#### `createDragDataValidator<T>(key: symbol)`

Creates a type guard function for validating drag data.

#### `createInstanceId(name: string)`

Creates a unique instance identifier for isolating drag operations.

### High-Level Utilities

#### `createDraggableItem<T>(config: UseDraggableItemConfig<T>)`

Sets up a draggable item with drop target capabilities.

#### `createListMonitor<T>(config: UseListMonitorConfig<T>)`

Creates a monitor for handling list reordering operations.

#### `performReorder<T>(params)`

Utility function for reordering arrays with proper edge handling.

#### `createEdgeChangeHandler(config)`

Creates a handler for managing drop indicator edges during drag operations.

#### `shouldHideDropIndicator(closestEdge, sourceIndex, targetIndex)`

Utility to determine when drop indicators should be hidden to avoid visual clutter.

## Complete Implementation Example

```tsx
import { useCallback, useEffect, useState } from 'react';
import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createInstanceId,
    createListMonitor,
    createEdgeChangeHandler,
    performReorder,
    type ReorderParams,
} from '@/components/shared/dragAndDropUtils';
import SortableSection from '@/components/shared/SortableSection/SortableSection';

// 1. Create shared symbols and functions
const itemKey = createDragDataKey('myItem');
const createItemData = createDragDataFactory<MyItemType>(itemKey);
const isItemData = createDragDataValidator<MyItemType>(itemKey);

const MyListComponent = () => {
    const [items, setItems] = useState<MyItemType[]>([]);
    const [instanceId] = useState(() => createInstanceId('my-list'));

    // 2. Setup reorder handler
    const reorderItems = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            const reorderedItems = performReorder({
                items,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (reorderedItems !== items) {
                setItems(reorderedItems);
            }
        },
        [items],
    );

    // 3. Setup monitor
    useEffect(() => {
        return createListMonitor({
            instanceId,
            items,
            isDragData: isItemData,
            onReorder: reorderItems,
            getItemId: (item) => item.id,
        });
    }, [instanceId, items, reorderItems]);

    // 4. Render items
    return (
        <div>
            {items.map((item, index) => (
                <MyListItem
                    key={item.id}
                    item={item}
                    index={index}
                    instanceId={instanceId}
                    createDragData={createItemData}
                    isDragData={isItemData}
                    onReorder={reorderItems}
                />
            ))}
        </div>
    );
};
```

### With Drop Indicators

For components that need visual drop indicators, you can use the edge change handlers:

```tsx
const MyListItem = ({ item, index, instanceId, createDragData, isDragData }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const edgeChangeHandler = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            item,
            index,
            instanceId,
            createDragData,
            isDragData,
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
            onEdgeChange: edgeChangeHandler,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [item, index, instanceId, createDragData, isDragData]);

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.4 : 1 }}>
            {item.content}
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};
```

## Currently Used In

-   `src/components/List/EditList/` - Literature list editing
-   `src/components/Review/EditReview/` - Review section management
-   `src/components/Review/Sections/Ontology/SelectEntitiesModal/` - Entity selection and ordering
-   `src/components/shared/SortableSection/` - Base sortable section component

## Dependencies

-   `@atlaskit/pragmatic-drag-and-drop`
-   `@atlaskit/pragmatic-drag-and-drop-hitbox`
-   `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator`
