import { faCheck, faGripVertical, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Accordion } from '@heroui/react';
import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import { parseInt } from 'lodash';
import { FC } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import SlotForms from '@/components/RosettaStone/RosettaTemplateEditor/SlotForms/SlotForms';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { RSPropertyShape } from '@/services/backend/types';

type PositionItemProps = {
    i: number;
    property: RSPropertyShape;
    instanceId: symbol;
    moveItem: MoveItem;
};

const PositionItem: FC<PositionItemProps> = ({ i, property, instanceId, moveItem }) => {
    const { numberLockedProperties } = useRosettaTemplateEditorState();

    const isLocked = !!numberLockedProperties && numberLockedProperties >= i + 1;
    // subject (0) and verb (1) are always locked; locked rows are neither drag sources nor drop targets
    const isLockedPosition = i === 0 || i === 1 || isLocked;

    const dispatch = useRosettaTemplateEditorDispatch();

    const isRequiredObject = (p: RSPropertyShape) => p?.min_count !== null && p?.min_count !== undefined && parseInt(p.min_count.toString()) > 0;

    const handleDeleteObjectPosition = (index: number) => {
        dispatch({ type: 'deleteObjectPosition', payload: index });
    };

    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index: i,
        isDisabled: isLockedPosition,
        moveItem,
        dragHandleLabel: 'Drag to reorder position',
    });

    const deleteButtonMessage = isLocked ? 'This position cannot be deleted because it is locked' : 'Delete object position';

    return (
        <Accordion.Item
            id={property?.id ?? i.toString()}
            className="relative rounded border border-separator"
            style={{ opacity: isDragging ? 0.4 : 1 }}
        >
            <Accordion.Heading className="relative">
                <Accordion.Trigger
                    ref={elementRef}
                    className="flex w-full items-center gap-2 rounded-t bg-surface-secondary px-3 py-2.5 pe-16 text-surface-secondary-foreground hover:bg-surface-tertiary aria-expanded:bg-surface-tertiary aria-expanded:rounded-b-none [&:not([aria-expanded='true'])]:rounded-b"
                >
                    {!isLockedPosition && (
                        <div ref={dragHandleRef} {...dragHandleProps} className="-ml-1 flex flex-col text-muted" style={{ cursor: 'move' }}>
                            <FontAwesomeIcon icon={faGripVertical} />
                            <FontAwesomeIcon icon={faGripVertical} style={{ marginTop: '-1.4px' }} />
                        </div>
                    )}
                    <div className="grow text-start">
                        {i === 0 && <b>{property?.placeholder ? property.placeholder : ' Subject '} *</b>}
                        {i === 1 && <b>{property?.placeholder ? property.placeholder : ' Verb '} *</b>}
                        {i !== 0 && i !== 1 && (
                            <>
                                {property?.placeholder ? property.placeholder : ` Object ${i - 1}`} {isRequiredObject(property) ? '*' : null}
                            </>
                        )}
                    </div>
                    <Accordion.Indicator />
                </Accordion.Trigger>
                <div className="absolute end-1 top-1/2 z-10 -translate-y-1/2">
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
                </div>
            </Accordion.Heading>
            <Accordion.Panel>
                <Accordion.Body className="bg-surface p-4 text-surface-foreground border border-separator rounded-b">
                    <SlotForms index={i} isLocked={isLocked} />
                </Accordion.Body>
            </Accordion.Panel>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" terminal className="text-primary" />}
        </Accordion.Item>
    );
};

export default PositionItem;
