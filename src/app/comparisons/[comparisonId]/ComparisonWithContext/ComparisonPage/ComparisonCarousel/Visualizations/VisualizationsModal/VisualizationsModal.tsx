import { faAdd, faLinkSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';

import useVisualizations from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/Visualizations/hooks/useVisualizations';
import ActionButton from '@/components/ActionButton/ActionButton';
import Confirm from '@/components/Confirmation/Confirmation';
import VisualizationPreview from '@/components/Resource/Tabs/Preview/VisualizationPreview/VisualizationPreview';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import AddVisualizationModal from '@/libs/selfVisModel/ComparisonComponents/AddVisualizationModal';

type VisualizationsModalProps = {
    toggle: () => void;
};

const VisualizationsModal: FC<VisualizationsModalProps> = ({ toggle }) => {
    const [isLoadingUnlink, setIsLoadingUnlink] = useState(false);
    const [isOpenVisualizationModal, setIsOpenVisualizationModal] = useState(false);

    const { visualizations, unlinkVisualization } = useVisualizations();

    const handleUnlink = async (id: string) => {
        const isConfirmed = await Confirm({
            title: 'Unlink visualization',
            message:
                "Visualizations are published after they are created. This means it is not possible to delete a visualization. You can however unlink a comparison, it won't show up in the list of visualizations on the comparison page anymore.",
            proceedLabel: 'Unlink',
        });
        if (isConfirmed) {
            setIsLoadingUnlink(true);
            unlinkVisualization(id);
            setIsLoadingUnlink(false);
        }
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Edit visualizations</ModalHeader>
            <ModalBody>
                {visualizations &&
                    visualizations.map((visualization) => (
                        <div className="border rounded p-2 mb-2 d-flex" key={visualization.id}>
                            <div style={{ width: 200 }} className="border-end d-flex align-items-center justify-content-center flex-shrink-0">
                                <VisualizationPreview id={visualization.id} width="200px" height="100px" className="" />
                            </div>
                            <div className="mx-3 d-flex justify-content-center flex-column border-end flex-grow-1">
                                <span className="fw-bold">{visualization.title}</span>
                                <div
                                    style={{
                                        WebkitLineClamp: 3,
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {visualization.description}
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <ActionButton
                                    title="Unlink visualization"
                                    icon={faLinkSlash}
                                    action={() => handleUnlink(visualization.id)}
                                    isLoading={isLoadingUnlink}
                                />
                            </div>
                        </div>
                    ))}

                <Button
                    color="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                        setIsOpenVisualizationModal(true);
                    }}
                >
                    <FontAwesomeIcon icon={faAdd} /> Add visualization
                </Button>
            </ModalBody>
            <AddVisualizationModal isOpenVisualizationModal={isOpenVisualizationModal} setIsOpenVisualizationModal={setIsOpenVisualizationModal} />
        </Modal>
    );
};

export default VisualizationsModal;
