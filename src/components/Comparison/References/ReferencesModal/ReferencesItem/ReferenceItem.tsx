import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useEffect, useRef, useState } from 'react';
import { Button, Input, InputGroup } from 'reactstrap';

import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';

// Create shared symbols and functions for reference drag and drop
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
        <div ref={ref} style={{ opacity: isDragging ? 0.4 : 1, position: 'relative' }}>
            <InputGroup className="mb-1">
                <Button
                    color="light"
                    innerRef={setDragHandleElement}
                    className="ps-3 pe-3"
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, cursor: 'move' }}
                    role="button"
                    tabIndex={0}
                    aria-label="Drag to reorder reference"
                >
                    <FontAwesomeIcon icon={faBars} />
                </Button>
                <Input
                    type="text"
                    value={reference.text}
                    onChange={(e) => onChange({ id: reference.id, text: e.target.value })}
                    placeholder='E.g. Vaswani, A. "Attention is all you need." (2017)'
                />
                <Button
                    color="light"
                    className="ps-3 pe-3"
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onClick={() => onDelete(reference.id)}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </InputGroup>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

export default ReferenceItem;
