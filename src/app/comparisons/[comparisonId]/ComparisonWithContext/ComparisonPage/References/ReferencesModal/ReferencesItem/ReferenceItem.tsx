import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, TextField } from '@heroui/react';
import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import { FC } from 'react';

type ReferenceItemProps = {
    reference: {
        id: string;
        text: string;
    };
    index: number;
    instanceId: symbol;
    moveItem: MoveItem;
    onDelete: (id: string) => void;
    onChange: ({ id, text }: { id: string; text: string }) => void;
};

const ReferenceItem: FC<ReferenceItemProps> = ({ reference, index, instanceId, moveItem, onDelete, onChange }) => {
    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index,
        moveItem,
        dragHandleLabel: 'Drag to reorder reference',
    });

    return (
        <div ref={elementRef} className="relative -my-1 py-1" style={{ opacity: isDragging ? 0.4 : 1 }}>
            <div className="flex items-stretch min-h-9">
                <Button
                    ref={dragHandleRef}
                    {...dragHandleProps}
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    className="!h-9 !rounded-e-none cursor-move"
                >
                    <FontAwesomeIcon icon={faBars} />
                </Button>
                <TextField fullWidth className="flex-1 min-w-0" value={reference.text} onChange={(text) => onChange({ id: reference.id, text })}>
                    <Input type="text" className="!rounded-none" placeholder='E.g. Vaswani, A. "Attention is all you need." (2017)' />
                </TextField>
                <Button
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    aria-label="Delete reference"
                    onPress={() => onDelete(reference.id)}
                    className="!h-9 !rounded-s-none -ms-px"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </div>
            {closestEdge && <DropIndicator edge={closestEdge} gap="0px" terminal className="text-primary" />}
        </div>
    );
};

export default ReferenceItem;
