import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, TextField } from '@heroui/react';
import { FC, useEffect, useRef, useState } from 'react';

import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';

export const referenceKey = createDragDataKey('reference');
export const createReferenceData = createDragDataFactory<{ id: string; text: string }>(referenceKey);
export const isReferenceData = createDragDataValidator<{ id: string; text: string }>(referenceKey);

type ReferenceItemProps = {
    reference: {
        id: string;
        text: string;
    };
    index: number;
    instanceId: symbol;
    onDelete: (id: string) => void;
    onChange: ({ id, text }: { id: string; text: string }) => void;
    totalItems: number;
};

const ReferenceItem: FC<ReferenceItemProps> = ({ reference, index, instanceId, onDelete, onChange, totalItems }) => {
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
            item: reference,
            index,
            instanceId,
            createDragData: createReferenceData,
            isDragData: isReferenceData,
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
    }, [reference, index, instanceId, totalItems, dragHandleElement]);

    return (
        <div ref={ref} className="relative" style={{ opacity: isDragging ? 0.4 : 1 }}>
            <div className="flex items-stretch min-h-9 mb-1">
                <Button
                    ref={setDragHandleElement as unknown as React.Ref<HTMLButtonElement>}
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    aria-label="Drag to reorder reference"
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
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

export default ReferenceItem;
