import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Chip, Modal } from '@heroui/react';
import { FC, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Confirm from '@/components/Confirmation/Confirmation';
import ReferenceModal from '@/components/Review/EditReview/ReferencesModal/ReferenceModal/ReferenceModal';
import useReview from '@/components/Review/hooks/useReview';

type ReferencesModalProps = {
    toggle: () => void;
};

const ReferencesModal: FC<ReferencesModalProps> = ({ toggle }) => {
    const [isOpenReferenceModal, setIsOpenReferenceModal] = useState(false);
    const [editReferenceIndex, setEditReferenceIndex] = useState<number | null>(null);
    const { review, parsedReferences, updateReview } = useReview();

    const handleDelete = async (referenceIndex: number) => {
        if (!review) {
            return;
        }
        const isConfirmed = await Confirm({
            title: 'Are you sure?',
            message: 'Do you want to remove this reference? ',
        });

        if (isConfirmed) {
            updateReview({
                references: [...review.references.slice(0, referenceIndex), ...review.references.slice(referenceIndex + 1)],
            });
        }
    };

    const handleEdit = (referenceIndex: number) => {
        setEditReferenceIndex(referenceIndex);
        setIsOpenReferenceModal(true);
    };

    const handleAdd = () => {
        setEditReferenceIndex(null);
        setIsOpenReferenceModal(true);
    };

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-3xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Manage references</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="space-y-4">
                        <Alert status="accent">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Description>
                                    Use references within content sections using the command <em>[@citationKey]</em>
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>

                        <ul className="m-0 flex w-full flex-col list-none divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-0">
                            {parsedReferences.map((reference) => (
                                <li key={reference.referenceIndex} className="flex items-start px-4 py-2 pr-2 text-foreground">
                                    <div className="grow">
                                        <Chip size="sm" variant="soft">
                                            @{reference.parsedReference['citation-key']}
                                        </Chip>{' '}
                                        {reference.parsedReference.author?.[0]?.family} {reference.parsedReference.author?.length > 1 && 'et al.'}{' '}
                                        <em>{reference.parsedReference.title}</em>
                                    </div>
                                    <div className="flex shrink-0">
                                        <Button
                                            isIconOnly
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Edit reference"
                                            className="mr-1 text-secondary"
                                            onPress={() => handleEdit(reference.referenceIndex)}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Delete reference"
                                            className="text-red-600 text-[120%]"
                                            onPress={() => handleDelete(reference.referenceIndex)}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                            {parsedReferences.length === 0 && <li className="text-center px-4 py-4">No references added yet</li>}
                        </ul>
                        <ButtonWithLoading size="sm" onPress={handleAdd} className="mt-2">
                            Add BibTeX
                        </ButtonWithLoading>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
            {isOpenReferenceModal && <ReferenceModal toggle={() => setIsOpenReferenceModal((v) => !v)} editReferenceIndex={editReferenceIndex} />}
        </Modal.Backdrop>
    );
};

export default ReferencesModal;
