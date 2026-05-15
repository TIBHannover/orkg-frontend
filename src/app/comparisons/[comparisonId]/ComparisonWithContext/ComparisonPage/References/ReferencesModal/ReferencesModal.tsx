import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal } from '@heroui/react';
import { uniqueId } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';

import ReferenceItem, {
    isReferenceData,
} from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/References/ReferencesModal/ReferencesItem/ReferenceItem';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';

type ReferencesModalProps = {
    toggle: () => void;
};

const ReferencesModal: FC<ReferencesModalProps> = ({ toggle }) => {
    const [references, setReferences] = useState<{ text: string; id: string }[]>([]);
    const [instanceId] = useState(() => createInstanceId('references-modal'));
    const { comparison, updateComparison } = useComparison();

    useEffect(() => {
        if (comparison?.references) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={handleOpenChange}>
            <Modal.Container size="lg">
                <Modal.Dialog className="max-w-3xl">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Edit references</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-2">
                        {references.length === 0 && (
                            <Alert status="accent" className="mb-0">
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
                        <Button variant="secondary" size="sm" className="mt-2 self-start" onPress={handleAdd}>
                            <FontAwesomeIcon icon={faAdd} /> Add reference
                        </Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onPress={handleSave}>Save</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ReferencesModal;
