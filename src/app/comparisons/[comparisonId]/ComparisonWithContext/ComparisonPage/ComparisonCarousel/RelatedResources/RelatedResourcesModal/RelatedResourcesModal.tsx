import { faAdd, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { FC, useState } from 'react';

import useRelatedResources from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/RelatedResources/hooks/useRelatedResources';
import AddEditRelatedResourceModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/RelatedResources/RelatedResourcesModal/AddEditRelatedResourceModal/AddEditRelatedResourceModal';
import ActionButton from '@/components/ActionButton/ActionButton';

type RelatedResourcesModalProps = {
    toggle: () => void;
};

const RelatedResourcesModal: FC<RelatedResourcesModalProps> = ({ toggle }) => {
    const [isOpenAddEditRelatedResourceModal, setIsOpenAddEditRelatedResourceModal] = useState(false);
    const [editRelatedResourceId, setEditRelatedResourceId] = useState<string | null>(null);
    const { relatedResources, deleteRelatedResource } = useRelatedResources();

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
                            <Modal.Heading>Edit related resources</Modal.Heading>
                            <Modal.CloseTrigger className="static" />
                        </Modal.Header>
                        <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-2">
                            {relatedResources?.map((relatedResource) => (
                                <div className="border rounded p-2 flex" key={relatedResource.id}>
                                    <div style={{ width: 200 }} className="border-end flex items-center justify-center shrink-0">
                                        {relatedResource.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={relatedResource.image}
                                                className="border rounded"
                                                style={{ maxWidth: 150, maxHeight: 80 }}
                                                alt={relatedResource.description}
                                            />
                                        ) : (
                                            <span className="italic">No thumbnail</span>
                                        )}
                                    </div>
                                    <div className="mx-4 flex justify-center flex-col border-end grow">
                                        <a href={relatedResource.url} target="_blank">
                                            {relatedResource.label}
                                        </a>
                                        <div
                                            style={{
                                                WebkitLineClamp: 3,
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {relatedResource.description}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <ActionButton
                                            title="Edit related resource"
                                            icon={faPen}
                                            action={() => {
                                                setEditRelatedResourceId(relatedResource.id);
                                                setIsOpenAddEditRelatedResourceModal(true);
                                            }}
                                        />
                                        <ActionButton
                                            title="Delete related resource"
                                            icon={faTimes}
                                            action={() => deleteRelatedResource(relatedResource.id)}
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
                                    setEditRelatedResourceId(null);
                                    setIsOpenAddEditRelatedResourceModal(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faAdd} /> Add related resource
                            </Button>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
            {isOpenAddEditRelatedResourceModal && (
                <AddEditRelatedResourceModal
                    toggle={() => setIsOpenAddEditRelatedResourceModal((v) => !v)}
                    relatedResourceId={editRelatedResourceId}
                />
            )}
        </>
    );
};

export default RelatedResourcesModal;
