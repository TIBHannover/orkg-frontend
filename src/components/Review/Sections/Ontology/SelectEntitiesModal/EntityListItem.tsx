import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faMinusCircle, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import capitalize from 'capitalize';
import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import Button from '@/components/Ui/Button/Button';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
import { ReviewSectionData } from '@/services/backend/types';

const DragHandle = styled.div`
    cursor: move;
    color: #a5a5a5;
    width: 30px;
    text-align: center;
    flex-shrink: 0;
`;

const ListGroupItemStyled = styled(ListGroupItem)`
    padding: 10px 10px 9px 5px !important;
    display: flex !important;
`;

// Create shared symbols and functions for entity drag and drop
export const entityKey = createDragDataKey('selectEntity');
export const createEntityData = createDragDataFactory<ReviewSectionData | Omit<ReviewSectionData, 'classes'>>(entityKey);
export const isEntityData = createDragDataValidator<ReviewSectionData | Omit<ReviewSectionData, 'classes'>>(entityKey);

type EntityListItemProps = {
    entity: ReviewSectionData | Omit<ReviewSectionData, 'classes'>;
    index: number;
    instanceId: symbol;
    onRemove: (entityId: string) => void;
    totalItems: number;
};

const EntityListItem: FC<EntityListItemProps> = ({ entity, index, instanceId, onRemove, totalItems }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            dragHandle: dragHandleElement || undefined,
            item: entity,
            index,
            instanceId,
            createDragData: createEntityData,
            isDragData: isEntityData,
            onDragStart: () => {
                setIsDragging(true);
                setClosestEdge(null);
            },
            onDrop: () => {
                setIsDragging(false);
                setClosestEdge(null);
            },
            onEdgeChange,
            onDragEnter: onEdgeChange,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [entity, index, instanceId, totalItems, dragHandleElement]);

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.4 : 1, position: 'relative' }}>
            <ListGroupItemStyled className="py-2 d-flex justify-content-between">
                <div className="d-flex">
                    <DragHandle ref={setDragHandleElement} role="button" tabIndex={0} aria-label="Drag to reorder entity">
                        <FontAwesomeIcon icon={faSort} />
                    </DragHandle>
                    {capitalize(entity.label)}
                </div>
                <Button color="link" className="p-0 ms-2" onClick={() => onRemove(entity.id)}>
                    <FontAwesomeIcon icon={faMinusCircle} />
                </Button>
            </ListGroupItemStyled>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

export default EntityListItem;
