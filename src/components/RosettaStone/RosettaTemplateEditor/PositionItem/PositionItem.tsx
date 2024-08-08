import { faCheck, faGripVertical, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import SlotForms from 'components/RosettaStone/RosettaTemplateEditor/SlotForms/SlotForms';
import { useRosettaTemplateEditorDispatch } from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import type { Identifier } from 'dnd-core';
import { parseInt } from 'lodash';
import { FC, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
import { PropertyShape } from 'services/backend/types';
import { handleSortableHoverReactDnd } from 'utils';

type PositionItemProps = {
    i: number;
    property: PropertyShape;
    moveCard: (update: { dragIndex: number; hoverIndex: number }) => void;
};

const ItemTypes = {
    OBJECT_POSITION: 'ObjectPosition',
};

const PositionItem: FC<PositionItemProps> = ({ i, property, moveCard }) => {
    const dispatch = useRosettaTemplateEditorDispatch();

    const isRequiredObject = (p: PropertyShape) => p?.min_count !== null && p?.min_count !== undefined && parseInt(p.min_count.toString()) > 0;

    const handleDeleteObjectPosition = (index: number) => {
        dispatch({ type: 'deleteObjectPosition', payload: index });
    };

    const ref = useRef<HTMLElement>(null);

    const [{ handlerId }, drop] = useDrop<PropertyShape & { index: number }, void, { handlerId: Identifier | null }>({
        accept: ItemTypes.OBJECT_POSITION,
        canDrop: () => i !== 0 && i !== 1,
        collect: (monitor) => {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover: (item: PropertyShape & { index: number }, monitor) => {
            if (monitor.canDrop()) {
                handleSortableHoverReactDnd({ item, monitor, currentRef: ref.current, hoverIndex: i, handleUpdate: moveCard });
            }
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.OBJECT_POSITION,
        item: () => {
            return { ...property, index: i };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => i !== 0 && i !== 1,
    });

    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return (
        <AccordionItem style={{ opacity }}>
            <AccordionHeader innerRef={ref} data-handler-id={handlerId} targetId={property?.id ?? i.toString()} className="d-flex">
                {i !== 0 && i !== 1 && (
                    <div className="me-1 d-flex flex-column" style={{ marginLeft: '-15px', cursor: 'move' }}>
                        <Icon icon={faGripVertical} className="text-secondary" />
                        <Icon icon={faGripVertical} className="text-secondary" style={{ marginTop: '-1.4px' }} />
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
                <StatementActionButton
                    title={i === 0 || i === 1 ? 'Subject and Verb position are required' : 'Delete object position'}
                    icon={faTrash}
                    requireConfirmation
                    isDisabled={i === 0 || i === 1}
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
                <SlotForms index={i} />
            </AccordionBody>
        </AccordionItem>
    );
};

export default PositionItem;
