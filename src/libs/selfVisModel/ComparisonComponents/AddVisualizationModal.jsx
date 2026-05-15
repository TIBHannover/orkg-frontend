import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, Tabs } from '@heroui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { usePrevious } from 'react-use';

import useComparisonExport from '@/components/Comparison/ComparisonTable/hooks/useComparisonExport';
import useComparison from '@/components/Comparison/hooks/useComparison';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useParams from '@/components/useParams/useParams';
import HelpVideoModal from '@/libs/selfVisModel/ComparisonComponents/HelpVideoModal';
import PublishVisualization from '@/libs/selfVisModel/ComparisonComponents/PublishVisualization';
import CellEditor from '@/libs/selfVisModel/RenderingComponents/CellEditor';
import CellSelector from '@/libs/selfVisModel/RenderingComponents/CellSelector';
import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';
import VisualizationWidget from '@/libs/selfVisModel/VisRenderer/VisualizationWidget';

function AddVisualizationModal({ isOpenVisualizationModal, setIsOpenVisualizationModal }) {
    const [processStep, setProcessStep] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [loadedModel, setLoadedModel] = useState(false);
    const [showPublishVisualizationDialog, setShowPublishVisualizationDialog] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);

    const { comparisonId } = useParams();
    const prevProcessStep = usePrevious(processStep);
    const { comparison, comparisonContents, selectedPathsFlattened } = useComparison();
    const { table } = useComparisonExport();
    const prevShowDialog = usePrevious(isOpenVisualizationModal);

    const updateDimensions = () => {
        const offset = 300;
        const modalBody = document.getElementById('selfVisServiceModalBody');
        let width = 800;

        if (modalBody) {
            width = modalBody.getBoundingClientRect().width;
        }
        setWindowHeight(window.innerHeight - offset);
        setWindowWidth(width);
    };

    useEffect(() => {
        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    useEffect(() => {
        if (isOpenVisualizationModal) {
            if (!prevShowDialog) {
                new SelfVisDataModel().resetCustomizationModel();
                setProcessStep(0);
                onLoadModal();
                setLoadedModel(true);
            } else if (prevProcessStep === 0 && processStep === 2) {
                new SelfVisDataModel().forceCellValidation();
                new SelfVisDataModel().createGDCDataModel();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpenVisualizationModal, processStep]);

    const compareWidth = (assumedWidth) => {
        const modalBody = document.getElementById('selfVisServiceModalBody');
        if (modalBody) {
            return modalBody.getBoundingClientRect().width;
        }
        return assumedWidth;
    };

    const onLoadModal = () => {
        const mmr = new SelfVisDataModel();

        const propsWithId = table
            .map((row) => selectedPathsFlattened.find((prop) => prop?.id === row.pathId))
            .map((p, index) => ({ ...p, id: `${index}${p.id}/${p.path.join('/')}` }));

        mmr.integrateInputData({
            properties: propsWithId,
            data: Object.fromEntries(propsWithId.map((p, index) => [p.id, table?.[index]?.values.map((v) => (v ? [v] : undefined))])),
            sources:
                comparisonContents?.titles?.map((title, i) => ({
                    id: comparisonContents.subtitles[i]?.id ?? title.id,
                    label: comparisonContents.subtitles[i]?.label ?? title.label,
                })) ?? [],
            sourceIds: comparison?.sources.map(({ id }) => id) ?? [],
        });
    };

    const handleOpenChange = (open) => {
        if (!open) {
            setIsOpenVisualizationModal(false);
        }
    };

    return (
        <Modal.Backdrop isOpen={isOpenVisualizationModal} onOpenChange={handleOpenChange}>
            <Modal.Container className="!max-w-none !w-[90vw]">
                <Modal.Dialog className="!max-w-none w-full max-h-[85vh] overflow-y-auto mb-0">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading className="flex items-center gap-3">
                            Create comparison visualization
                            <Button variant="outline" size="sm" onPress={() => setShowVideoModal(!showVideoModal)}>
                                How to use <FontAwesomeIcon className="ml-1" icon={faQuestionCircle} />
                            </Button>
                        </Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body id="selfVisServiceModalBody" className="pt-4 pb-2 px-1">
                        <Tabs selectedKey={String(processStep)} onSelectionChange={(key) => setProcessStep(Number(key))}>
                            <Tabs.List>
                                <Tabs.Tab id="0">Select</Tabs.Tab>
                                <Tabs.Tab id="1">Map &amp; edit</Tabs.Tab>
                                <Tabs.Tab id="2">Visualize</Tabs.Tab>
                            </Tabs.List>
                            <Tabs.Panel id="0">
                                <CellSelector isLoading={!loadedModel} height={windowHeight - 50} />
                            </Tabs.Panel>
                            <Tabs.Panel id="1">
                                <CellEditor isLoading={!loadedModel} height={windowHeight - 50} />
                            </Tabs.Panel>
                            <Tabs.Panel id="2">
                                <VisualizationWidget
                                    isLoading={!loadedModel}
                                    height={windowHeight - 10}
                                    width={windowWidth}
                                    comparePropsWithActualWidth={compareWidth}
                                />
                            </Tabs.Panel>
                        </Tabs>

                        <HelpVideoModal showDialog={showVideoModal} toggle={() => setShowVideoModal(!showVideoModal)} />

                        <PublishVisualization
                            showDialog={showPublishVisualizationDialog}
                            toggle={() => setShowPublishVisualizationDialog(!showPublishVisualizationDialog)}
                            closeAllAndReloadVisualizations={() => {
                                setShowPublishVisualizationDialog(!showPublishVisualizationDialog);
                                setIsOpenVisualizationModal(!isOpenVisualizationModal);
                            }}
                            comparisonId={comparisonId}
                        />
                    </Modal.Body>
                    <Modal.Footer className="p-2">
                        {processStep === 1 && <div className="absolute left-0">Please select at least one mapper at the top of a column.</div>}
                        <div className="flex justify-end">
                            {processStep > 0 && (
                                <Button variant="secondary" className="mr-2" onPress={() => setProcessStep(processStep - 1)}>
                                    Previous
                                </Button>
                            )}
                            {processStep <= 1 && (
                                <Button className="mr-2" onPress={() => setProcessStep(processStep + 1)}>
                                    Next
                                </Button>
                            )}
                            {processStep === 2 && (
                                <RequireAuthentication
                                    component={Button}
                                    className="mr-2"
                                    onPress={() => setShowPublishVisualizationDialog(!showPublishVisualizationDialog)}
                                >
                                    Publish
                                </RequireAuthentication>
                            )}
                        </div>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}

AddVisualizationModal.propTypes = {
    isOpenVisualizationModal: PropTypes.bool.isRequired,
    setIsOpenVisualizationModal: PropTypes.func.isRequired,
};

export default AddVisualizationModal;
