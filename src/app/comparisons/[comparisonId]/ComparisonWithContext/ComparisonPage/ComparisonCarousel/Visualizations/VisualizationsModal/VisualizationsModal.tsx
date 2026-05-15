import { faAdd, faLinkSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { FC, useState } from 'react';

import useVisualizations from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/Visualizations/hooks/useVisualizations';
import ActionButton from '@/components/ActionButton/ActionButton';
import Confirm from '@/components/Confirmation/Confirmation';
import VisualizationPreview from '@/components/Resource/Tabs/Preview/VisualizationPreview/VisualizationPreview';
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
                        <Modal.Heading>Edit visualizations</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-2">
                        {visualizations?.map((visualization) => (
                            <div className="border rounded p-2 flex" key={visualization.id}>
                                <div style={{ width: 200 }} className="border-end flex items-center justify-center shrink-0">
                                    <VisualizationPreview id={visualization.id} width="200px" height="100px" className="" />
                                </div>
                                <div className="mx-4 flex justify-center flex-col border-end grow">
                                    <span className="font-bold">{visualization.title}</span>
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
                                <div className="flex items-center">
                                    <ActionButton
                                        title="Unlink visualization"
                                        icon={faLinkSlash}
                                        action={() => handleUnlink(visualization.id)}
                                        isLoading={isLoadingUnlink}
                                    />
                                </div>
                            </div>
                        ))}

                        <Button variant="secondary" size="sm" className="mt-2 self-start" onPress={() => setIsOpenVisualizationModal(true)}>
                            <FontAwesomeIcon icon={faAdd} /> Add visualization
                        </Button>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
            <AddVisualizationModal isOpenVisualizationModal={isOpenVisualizationModal} setIsOpenVisualizationModal={setIsOpenVisualizationModal} />
        </Modal.Backdrop>
    );
};

export default VisualizationsModal;
