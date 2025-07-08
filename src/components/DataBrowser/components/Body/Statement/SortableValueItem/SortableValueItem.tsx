import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import {
    createDragDataFactory,
    createDragDataKey,
    createDraggableItem,
    createEdgeChangeHandler,
    createInstanceId,
} from '@/components/shared/dnd/dragAndDropUtils';
import { Statement } from '@/services/backend/types';

type SortableValueItemProps = {
    statement: Statement;
    children: ReactElement;
};

export const DRAG_DATA_KEY = createDragDataKey('sortable-value-item');
export const INSTANCE_ID = createInstanceId('sortable-value-item');
export const createDragData = createDragDataFactory<Statement>(DRAG_DATA_KEY);
export const isDragData = (data: Record<string | symbol, unknown>): data is { item: Statement; index: number; instanceId: symbol } => {
    return data[DRAG_DATA_KEY] === true;
};

const SortableValueItem: FC<SortableValueItemProps> = ({ statement, children }) => {
    const { statements } = useEntity();
    const index = statements?.map((s) => s.id).indexOf(statement.id);
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const ref = useRef<HTMLDivElement>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const currentIndex = index ?? 0;

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: currentIndex,
            targetIndex: currentIndex,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            dragHandle: dragHandleElement || undefined,
            item: statement,
            index: currentIndex,
            instanceId: INSTANCE_ID,
            createDragData,
            isDragData,
            onDragStart: () => {
                setIsDragging(true);
                setClosestEdge(null);
            },
            onDrop: () => {
                setIsDragging(false);
                setClosestEdge(null);
            },
            onEdgeChange,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [statement, isEditMode, currentIndex, dragHandleElement]);

    const opacity = isDragging ? 0 : 1;

    return (
        <div ref={ref} className="d-flex align-items-center flex-grow-1 m-0 p-0 position-relative" style={{ opacity }}>
            {isEditMode && (
                <div className="px-2" ref={setDragHandleElement} style={{ cursor: 'move' }}>
                    <FontAwesomeIcon icon={faGripVertical} className="text-secondary" />
                </div>
            )}
            {children}
            {closestEdge && <DropIndicator edge={closestEdge} />}
        </div>
    );
};

export default SortableValueItem;
