import { faAdd, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import useRelatedResources from '@/components/Comparison/ComparisonCarousel/RelatedResources/hooks/useRelatedResources';
import AddEditRelatedResourceModal from '@/components/Comparison/ComparisonCarousel/RelatedResources/RelatedResourcesModal/AddEditRelatedResourceModal/AddEditRelatedResourceModal';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type RelatedResourcesModalProps = {
    toggle: () => void;
};

const RelatedResourcesModal: FC<RelatedResourcesModalProps> = ({ toggle }) => {
    const [isOpenAddEditRelatedResourceModal, setIsOpenAddEditRelatedResourceModal] = useState(false);
    const [editRelatedResourceId, setEditRelatedResourceId] = useState<string | null>(null);
    const { relatedResources, deleteRelatedResource } = useRelatedResources();

    return (
        <>
            <Modal isOpen toggle={toggle} size="lg">
                <ModalHeader toggle={toggle}>Edit related resources</ModalHeader>
                <ModalBody>
                    {relatedResources &&
                        relatedResources.map((relatedResource) => (
                            <div className="border rounded p-2 mb-2 d-flex" key={relatedResource.id}>
                                <div style={{ width: 200 }} className="border-end d-flex align-items-center justify-content-center flex-shrink-0">
                                    {relatedResource.image ? (
                                        //  eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={relatedResource.image}
                                            className="border rounded"
                                            style={{ maxWidth: 150, maxHeight: 80 }}
                                            alt={relatedResource.description}
                                        />
                                    ) : (
                                        <span className="fst-italic">No thumbnail</span>
                                    )}
                                </div>
                                <div className="mx-3 d-flex justify-content-center flex-column border-end flex-grow-1">
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
                                <div className="d-flex align-items-center">
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
                        color="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                            setEditRelatedResourceId(null);
                            setIsOpenAddEditRelatedResourceModal(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faAdd} /> Add related resource
                    </Button>
                </ModalBody>
            </Modal>
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
