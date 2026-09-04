import { faMinusCircle, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import capitalize from 'capitalize';
import { FC } from 'react';

import { ReviewSectionData } from '@/services/backend/types';

type EntityListItemProps = {
    entity: ReviewSectionData | Omit<ReviewSectionData, 'classes'>;
    index: number;
    instanceId: symbol;
    onRemove: (entityId: string) => void;
    moveItem: MoveItem;
};

const EntityListItem: FC<EntityListItemProps> = ({ entity, index, instanceId, onRemove, moveItem }) => {
    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index,
        moveItem,
        dragHandleLabel: 'Drag to reorder entity',
    });

    return (
        <div ref={elementRef} className={`relative ${isDragging ? 'opacity-40' : 'opacity-100'}`}>
            <li className="flex items-center justify-between border-b border-default-200 bg-surface py-2 pe-[10px] ps-[5px] text-foreground">
                <div className="flex items-center gap-2">
                    <div ref={dragHandleRef} {...dragHandleProps} className="w-[30px] shrink-0 cursor-move text-center text-muted">
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
            {/* the list's rounded corners need its overflow-hidden, so keep the ring inside */}
            {closestEdge && (
                <DropIndicator
                    edge={closestEdge}
                    gap="0px"
                    terminal="no-bleed"
                    className="text-primary"
                    style={closestEdge === 'bottom' ? { bottom: -2 } : undefined}
                />
            )}
        </div>
    );
};

export default EntityListItem;
