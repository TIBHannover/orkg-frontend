import { faAdd, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import ActionButton from '@/components/ActionButton/ActionButton';
import useRelatedFigures from '@/components/Comparison/ComparisonCarousel/RelatedFigures/hooks/useRelatedFigures';
import AddEditRelatedFigureModal from '@/components/Comparison/ComparisonCarousel/RelatedFigures/RelatedFiguresModal/AddEditRelatedFiguresModal/AddEditRelatedFiguresModal';
import Button from '@/components/Ui/Button/Button';

type RelatedFiguresModalProps = {
    toggle: () => void;
};

const RelatedFiguresModal: FC<RelatedFiguresModalProps> = ({ toggle }) => {
    const [isOpenAddEditRelatedFigureModal, setIsOpenAddEditRelatedFigureModal] = useState(false);
    const [editRelatedFigureId, setEditRelatedFigureId] = useState<string | null>(null);
    const { relatedFigures, deleteRelatedFigure } = useRelatedFigures();

    return (
        <>
            <Modal isOpen toggle={toggle} size="lg">
                <ModalHeader toggle={toggle}>Edit related figures</ModalHeader>
                <ModalBody>
                    {relatedFigures &&
                        relatedFigures.map((relatedFigure) => (
                            <div className="border rounded p-2 mb-2 d-flex" key={relatedFigure.id}>
                                <div style={{ width: 200 }} className="border-end d-flex align-items-center justify-content-center flex-shrink-0">
                                    {/*  eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={relatedFigure.image}
                                        className="border rounded"
                                        style={{ maxWidth: 150, maxHeight: 80 }}
                                        alt={relatedFigure.description}
                                    />
                                </div>
                                <div className="mx-3 d-flex justify-content-center flex-column border-end flex-grow-1">
                                    <span className="fw-bold">{relatedFigure.label}</span>
                                    <div
                                        style={{
                                            WebkitLineClamp: 3,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {relatedFigure.description}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <ActionButton
                                        title="Edit related figure"
                                        icon={faPen}
                                        action={() => {
                                            setEditRelatedFigureId(relatedFigure.id);
                                            setIsOpenAddEditRelatedFigureModal(true);
                                        }}
                                    />
                                    <ActionButton
                                        title="Delete related figure"
                                        icon={faTimes}
                                        action={() => deleteRelatedFigure(relatedFigure.id)}
                                        requireConfirmation
                                    />
                                </div>
                            </div>
                        ))}

                    <Button
                        color="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                            setEditRelatedFigureId(null);
                            setIsOpenAddEditRelatedFigureModal(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faAdd} /> Add related figure
                    </Button>
                </ModalBody>
            </Modal>
            {isOpenAddEditRelatedFigureModal && (
                <AddEditRelatedFigureModal toggle={() => setIsOpenAddEditRelatedFigureModal((v) => !v)} relatedFigureId={editRelatedFigureId} />
            )}
        </>
    );
};

export default RelatedFiguresModal;
