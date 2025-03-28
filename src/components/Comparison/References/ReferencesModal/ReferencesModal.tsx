import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniqueId } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import useComparison from '@/components/Comparison/hooks/useComparison';
import ReferenceItem from '@/components/Comparison/References/ReferencesModal/ReferencesItem/ReferenceItem';

type ReferencesModalProps = {
    toggle: () => void;
};

const ReferencesModal: FC<ReferencesModalProps> = ({ toggle }) => {
    const [references, setReferences] = useState<{ text: string; id: string }[]>([]);
    const { comparison, updateComparison } = useComparison();

    useEffect(() => {
        if (comparison?.references) {
            setReferences(
                comparison.references.map((text) => ({
                    text,
                    id: uniqueId(),
                })),
            );
        }
    }, [comparison]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setReferences((_references) => {
                const oldIndex = _references.findIndex((item) => item.id === (active.id as string));
                const newIndex = _references.findIndex((item) => item.id === (over?.id as string));

                return arrayMove(_references, oldIndex, newIndex);
            });
        }
    };

    const handleDelete = (id: string) => {
        setReferences((_references) => _references.filter((reference) => reference.id !== id));
    };

    const handleAdd = () => {
        setReferences((_references) => [
            ..._references,
            {
                id: uniqueId(),
                text: '',
            },
        ]);
    };

    const handleChange = ({ id, text }: { id: string; text: string }) => {
        setReferences((_references) => _references.map((reference) => (reference.id === id ? { ...reference, text } : reference)));
    };

    const handleSave = () => {
        updateComparison({ references: references.map((reference) => reference.text) });
        toggle();
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Edit references</ModalHeader>
            <ModalBody>
                {references.length === 0 && (
                    <Alert color="info" className="mb-0">
                        No references added yet
                    </Alert>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={references.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
                        {references.map((reference) => (
                            <ReferenceItem key={reference.id} reference={reference} onDelete={handleDelete} onChange={handleChange} />
                        ))}
                    </SortableContext>
                </DndContext>
                <Button color="secondary" size="sm" className="mt-2" onClick={handleAdd}>
                    <FontAwesomeIcon icon={faAdd} /> Add reference
                </Button>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ReferencesModal;
