import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faMinusCircle, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import capitalize from 'capitalize';
import { FC, useEffect, useRef, useState } from 'react';

import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import { ReviewSectionData } from '@/services/backend/types';

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
        <div ref={ref} className={`relative ${isDragging ? 'opacity-40' : 'opacity-100'}`}>
            <li className="flex items-center justify-between border-b border-default-200 bg-surface py-2 pe-[10px] ps-[5px] text-foreground">
                <div className="flex items-center gap-2">
                    <div
                        ref={setDragHandleElement}
                        role="button"
                        tabIndex={0}
                        aria-label="Drag to reorder entity"
                        className="w-[30px] shrink-0 cursor-move text-center text-muted"
                    >
                        <FontAwesomeIcon icon={faSort} />
                    </div>
                    {capitalize(entity.label)}
                </div>
                <Button
                    isIconOnly
                    variant="ghost"
                    aria-label="Remove entity"
                    className="!h-auto !min-w-0 !bg-transparent !p-0 ml-2 text-danger hover:!bg-transparent"
                    onPress={() => onRemove(entity.id)}
                >
                    <FontAwesomeIcon icon={faMinusCircle} />
                </Button>
            </li>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

export default EntityListItem;
