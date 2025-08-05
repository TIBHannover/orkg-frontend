import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniqueId } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';

import useComparison from '@/components/Comparison/hooks/useComparison';
import ReferenceItem, { isReferenceData } from '@/components/Comparison/References/ReferencesModal/ReferencesItem/ReferenceItem';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type ReferencesModalProps = {
    toggle: () => void;
};

const ReferencesModal: FC<ReferencesModalProps> = ({ toggle }) => {
    const [references, setReferences] = useState<{ text: string; id: string }[]>([]);
    const [instanceId] = useState(() => createInstanceId('references-modal'));
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

    const reorderReferences = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            const reorderedReferences = performReorder({
                items: references,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (reorderedReferences !== references) {
                setReferences(reorderedReferences);
            }
        },
        [references],
    );

    useEffect(() => {
        const cleanup = createListMonitor({
            instanceId,
            items: references,
            isDragData: isReferenceData,
            onReorder: reorderReferences,
            getItemId: (reference) => reference.id,
        });

        return () => {
            cleanup?.();
        };
    }, [instanceId, references, reorderReferences]);

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
                {references.map((reference, index) => (
                    <ReferenceItem
                        key={reference.id}
                        reference={reference}
                        index={index}
                        instanceId={instanceId}
                        onDelete={handleDelete}
                        onChange={handleChange}
                        totalItems={references.length}
                    />
                ))}
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
