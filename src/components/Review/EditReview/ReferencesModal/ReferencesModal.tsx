import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import { Alert, Badge, Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';

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
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Manage references</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    Use references within content sections using the command <em>[@citationKey]</em>
                </Alert>

                <ListGroup>
                    {parsedReferences.map((reference) => (
                        <ListGroupItem key={reference.referenceIndex} className="d-flex align-items-start pe-2">
                            <div className="flex-grow-1">
                                <Badge color="light">@{reference.parsedReference['citation-key']}</Badge>{' '}
                                {reference.parsedReference.author?.[0]?.family} {reference.parsedReference.author?.length > 1 && 'et al.'}{' '}
                                <em>{reference.parsedReference.title}</em>
                            </div>
                            <div className="d-flex flex-shrink-0">
                                <Button color="link" className="me-1 px-1 py-0 text-secondary" onClick={() => handleEdit(reference.referenceIndex)}>
                                    <FontAwesomeIcon icon={faPen} />
                                </Button>
                                <Button
                                    color="link"
                                    className="px-1 py-0 text-danger"
                                    style={{ fontSize: '120%' }}
                                    onClick={() => handleDelete(reference.referenceIndex)}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                            </div>
                        </ListGroupItem>
                    ))}
                    {parsedReferences.length === 0 && <div className="text-center mt-3">No references added yet</div>}
                </ListGroup>
                <ButtonWithLoading size="sm" onClick={handleAdd} className="mt-4">
                    Add BibTeX
                </ButtonWithLoading>
            </ModalBody>

            {isOpenReferenceModal && <ReferenceModal toggle={() => setIsOpenReferenceModal((v) => !v)} editReferenceIndex={editReferenceIndex} />}
        </Modal>
    );
};

export default ReferencesModal;
