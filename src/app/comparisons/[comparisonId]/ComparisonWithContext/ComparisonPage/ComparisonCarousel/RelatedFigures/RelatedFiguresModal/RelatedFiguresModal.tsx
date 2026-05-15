import { faAdd, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { FC, useState } from 'react';

import useRelatedFigures from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/RelatedFigures/hooks/useRelatedFigures';
import AddEditRelatedFigureModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/RelatedFigures/RelatedFiguresModal/AddEditRelatedFiguresModal/AddEditRelatedFiguresModal';
import ActionButton from '@/components/ActionButton/ActionButton';

type RelatedFiguresModalProps = {
    toggle: () => void;
};

const RelatedFiguresModal: FC<RelatedFiguresModalProps> = ({ toggle }) => {
    const [isOpenAddEditRelatedFigureModal, setIsOpenAddEditRelatedFigureModal] = useState(false);
    const [editRelatedFigureId, setEditRelatedFigureId] = useState<string | null>(null);
    const { relatedFigures, deleteRelatedFigure } = useRelatedFigures();

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <>
            <Modal.Backdrop isOpen onOpenChange={handleOpenChange}>
                <Modal.Container size="lg">
                    <Modal.Dialog className="max-w-3xl">
                        <Modal.Header className="flex-row items-center justify-between gap-3">
                            <Modal.Heading>Edit related figures</Modal.Heading>
                            <Modal.CloseTrigger className="static" />
                        </Modal.Header>
                        <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-2">
                            {relatedFigures?.map((relatedFigure) => (
                                <div className="border rounded p-2 flex" key={relatedFigure.id}>
                                    <div style={{ width: 200 }} className="border-end flex items-center justify-center shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={relatedFigure.image}
                                            className="border rounded"
                                            style={{ maxWidth: 150, maxHeight: 80 }}
                                            alt={relatedFigure.description}
                                        />
                                    </div>
                                    <div className="mx-4 flex justify-center flex-col border-end grow">
                                        <span className="font-bold">{relatedFigure.label}</span>
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
                                    <div className="flex items-center">
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
                                variant="secondary"
                                size="sm"
                                className="mt-2 self-start"
                                onPress={() => {
                                    setEditRelatedFigureId(null);
                                    setIsOpenAddEditRelatedFigureModal(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faAdd} /> Add related figure
                            </Button>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
            {isOpenAddEditRelatedFigureModal && (
                <AddEditRelatedFigureModal toggle={() => setIsOpenAddEditRelatedFigureModal((v) => !v)} relatedFigureId={editRelatedFigureId} />
            )}
        </>
    );
};

export default RelatedFiguresModal;
