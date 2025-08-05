import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faCheck, faGripVertical, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { parseInt } from 'lodash';
import { FC, useEffect, useRef, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import SlotForms from '@/components/RosettaStone/RosettaTemplateEditor/SlotForms/SlotForms';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import AccordionBody from '@/components/Ui/Accordion/AccordionBody';
import AccordionHeader from '@/components/Ui/Accordion/AccordionHeader';
import AccordionItem from '@/components/Ui/Accordion/AccordionItem';
import { RSPropertyShape } from '@/services/backend/types';

// Create shared symbols and functions for position drag and drop
export const positionKey = createDragDataKey('rosettaPosition');
export const createPositionData = createDragDataFactory<RSPropertyShape>(positionKey);
export const isPositionData = createDragDataValidator<RSPropertyShape>(positionKey);

type PositionItemProps = {
    i: number;
    property: RSPropertyShape;
    instanceId: symbol;
    totalItems: number;
};

const PositionItem: FC<PositionItemProps> = ({ i, property, instanceId, totalItems }) => {
    const { numberLockedProperties } = useRosettaTemplateEditorState();
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef<HTMLElement>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);

    const isLocked = !!numberLockedProperties && numberLockedProperties >= i + 1;

    const dispatch = useRosettaTemplateEditorDispatch();

    const isRequiredObject = (p: RSPropertyShape) => p?.min_count !== null && p?.min_count !== undefined && parseInt(p.min_count.toString()) > 0;

    const handleDeleteObjectPosition = (index: number) => {
        dispatch({ type: 'deleteObjectPosition', payload: index });
    };

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: i,
            targetIndex: i,
            setClosestEdge: (edge) => {
                // Don't show drop indicator for locked positions
                if (i === 0 || i === 1 || isLocked) {
                    setClosestEdge(null);
                } else {
                    setClosestEdge(edge);
                }
            },
        });

        return createDraggableItem({
            element,
            dragHandle: dragHandleElement || undefined,
            item: property,
            index: i,
            instanceId,
            createDragData: createPositionData,
            isDragData: isPositionData,
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
            canDrop: ({ target }) => {
                // Don't allow drops on locked positions (subject and verb)
                return target.index !== 0 && target.index !== 1;
            },
        });
    }, [property, i, instanceId, totalItems, dragHandleElement, isLocked]);

    const deleteButtonMessage = isLocked ? 'This position cannot be deleted because it is locked' : 'Delete object position';

    return (
        <AccordionItem style={{ opacity: isDragging ? 0.4 : 1, position: 'relative' }}>
            <AccordionHeader innerRef={ref} targetId={property?.id ?? i.toString()} className="d-flex">
                {i !== 0 && i !== 1 && !isLocked && (
                    <div
                        ref={setDragHandleElement}
                        className="me-1 d-flex flex-column"
                        style={{ marginLeft: '-15px', cursor: 'move' }}
                        role="button"
                        tabIndex={0}
                        aria-label="Drag to reorder position"
                    >
                        <FontAwesomeIcon icon={faGripVertical} className="text-secondary" />
                        <FontAwesomeIcon icon={faGripVertical} className="text-secondary" style={{ marginTop: '-1.4px' }} />
                    </div>
                )}
                <div className="flex-grow-1">
                    {i === 0 && <b>{property?.placeholder ? property.placeholder : ' Subject '} *</b>}
                    {i === 1 && <b>{property?.placeholder ? property.placeholder : ' Verb '} *</b>}
                    {i !== 0 && i !== 1 && (
                        <>
                            {property?.placeholder ? property.placeholder : ` Object ${i - 1}`} {isRequiredObject(property) ? '*' : null}
                        </>
                    )}
                </div>
                <ActionButton
                    title={i === 0 || i === 1 ? 'Subject and Verb position are required' : deleteButtonMessage}
                    icon={faTrash}
                    requireConfirmation
                    isDisabled={i === 0 || i === 1 || isLocked}
                    confirmationMessage="Are you sure to delete?"
                    confirmationButtons={[
                        {
                            title: 'Delete',
                            color: 'danger',
                            icon: faCheck,
                            action: () => handleDeleteObjectPosition(i),
                        },
                        {
                            title: 'Cancel',
                            color: 'secondary',
                            icon: faTimes,
                        },
                    ]}
                />
            </AccordionHeader>
            <AccordionBody accordionId={property.id ?? i.toString()} style={{ background: '#fff' }}>
                <SlotForms index={i} isLocked={isLocked} />
            </AccordionBody>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </AccordionItem>
    );
};

export default PositionItem;
