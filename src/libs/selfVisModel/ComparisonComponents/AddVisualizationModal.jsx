import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'react-use';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import styled from 'styled-components';

import { activatedContributionsToList } from '@/components/Comparison/hooks/helpers';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useParams from '@/components/useParams/useParams';
import HelpVideoModal from '@/libs/selfVisModel/ComparisonComponents/HelpVideoModal';
import PublishVisualization from '@/libs/selfVisModel/ComparisonComponents/PublishVisualization';
import CellEditor from '@/libs/selfVisModel/RenderingComponents/CellEditor';
import CellSelector from '@/libs/selfVisModel/RenderingComponents/CellSelector';
import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';
import VisualizationWidget from '@/libs/selfVisModel/VisRenderer/VisualizationWidget';
import { setIsOpenVisualizationModal } from '@/slices/comparisonSlice';

const TabButtons = styled.div`
    border-bottom: 2px solid ${(props) => props.theme.lightDarker};
    display: flex;
`;

const TabButton = styled.div`
    cursor: pointer;
    padding: 4px 20px;
    background-color: ${(props) => (props.active ? props.theme.primary : props.theme.light)};
    border: ${(props) => (props.active ? 'none' : `1px solid ${props.theme.lightDarker}`)};
    border-bottom: 0;
    color: ${(props) => (props.active ? '#ffffff' : '')};
    font-size: 18px;

    &:first-child {
        margin-left: 5px;
        border-top-left-radius: 10px;
        border-right: 0px;
    }
    &:last-child {
        border-top-right-radius: 10px;
        border-left: 0px;
    }
`;

function AddVisualizationModal() {
    const { comparisonId } = useParams();

    const [processStep, setProcessStep] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [loadedModel, setLoadedModel] = useState(false);
    const [showPublishVisualizationDialog, setShowPublishVisualizationDialog] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const prevProcessStep = usePrevious(processStep);

    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.comparison);
    const contributions = useSelector((state) => state.comparison.contributions.filter((c) => c.active));
    const properties = useSelector((state) => state.comparison.properties.filter((c) => c.active));
    const useReconstructedDataInVisualization = useSelector((state) => state.comparison.useReconstructedDataInVisualization);
    const isOpenVisualizationModal = useSelector((state) => state.comparison.isOpenVisualizationModal);
    const prevShowDialog = usePrevious(isOpenVisualizationModal);

    const predicatesList = useSelector((state) => state.comparison.configuration.predicatesList);
    const contributionsList = useSelector((state) => activatedContributionsToList(state.comparison.contributions));

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
                if (useReconstructedDataInVisualization) {
                    // set the state last tab;
                    setProcessStep(2);
                } else {
                    // reset the model >> this is called when we start the visualization modal
                    new SelfVisDataModel().resetCustomizationModel();
                    setProcessStep(0);
                }
            } else if (prevProcessStep === 0 && processStep === 2) {
                // this shall trigger the cell validation
                // shall be done when the user switches between select directly to visualize
                new SelfVisDataModel().forceCellValidation(); // singleton call
                new SelfVisDataModel().createGDCDataModel(); // gets the singleton ptr and creates the gdc model
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
        // check if we need to run the parser
        const mmr = new SelfVisDataModel(); // this is a singleton
        mmr.integrateInputData({
            contributions,
            properties,
            data,
            contributionsList,
            predicatesList,
        });
    };

    return (
        <Modal
            isOpen={isOpenVisualizationModal}
            toggle={() => dispatch(setIsOpenVisualizationModal(!isOpenVisualizationModal))}
            size="lg"
            onOpened={() => {
                onLoadModal();
                setLoadedModel(true);
            }}
            style={{ maxWidth: '90%', marginBottom: 0 }}
        >
            <ModalHeader toggle={() => dispatch(setIsOpenVisualizationModal(!isOpenVisualizationModal))}>
                Create comparison visualization
                <Button
                    outline
                    color="secondary"
                    size="sm"
                    className="ms-3"
                    onClick={() => {
                        setShowVideoModal(!showVideoModal);
                    }}
                >
                    How to use <FontAwesomeIcon className="ms-1" icon={faQuestionCircle} />
                </Button>
            </ModalHeader>
            <ModalBody id="selfVisServiceModalBody">
                <TabButtons>
                    {/*  TAB BUTTONS */}
                    <TabButton active={processStep === 0} onClick={() => setProcessStep(0)}>
                        Select
                    </TabButton>
                    <TabButton active={processStep === 1} onClick={() => setProcessStep(1)}>
                        Map &amp; edit
                    </TabButton>
                    <TabButton active={processStep === 2} onClick={() => setProcessStep(2)}>
                        Visualize
                    </TabButton>
                </TabButtons>
                {/*  renders different views based on the current step in the process */}
                {processStep === 0 && <CellSelector isLoading={!loadedModel} height={windowHeight - 50} />}
                {processStep === 1 && <CellEditor isLoading={!loadedModel} height={windowHeight - 50} />}
                {processStep === 2 && (
                    <VisualizationWidget
                        isLoading={!loadedModel}
                        height={windowHeight - 10}
                        width={windowWidth}
                        comparePropsWithActualWidth={compareWidth}
                    />
                )}

                <HelpVideoModal showDialog={showVideoModal} toggle={() => setShowVideoModal(!showVideoModal)} />

                <PublishVisualization
                    showDialog={showPublishVisualizationDialog}
                    toggle={() => setShowPublishVisualizationDialog(!showPublishVisualizationDialog)}
                    closeAllAndReloadVisualizations={() => {
                        setShowPublishVisualizationDialog(!showPublishVisualizationDialog);
                        dispatch(setIsOpenVisualizationModal(!isOpenVisualizationModal));
                    }}
                    comparisonId={comparisonId}
                />
            </ModalBody>
            <ModalFooter className="p-2">
                {/*
                    <Button
                        color="primary"
                        className="me-2"
                        onClick={() => {
                            const mmr = new SelfVisDataModel(); // this is a singleton
                            mmr.debug();
                        }}
                    >
                        Debug
                    </Button>
                    */}

                {processStep === 1 && <div style={{ position: 'absolute', left: 0 }}>Please select at least one mapper at the top of a column.</div>}
                <div className="d-flex justify-content-end">
                    {processStep > 0 && (
                        <Button color="light" className="me-2" onClick={() => setProcessStep(processStep - 1)}>
                            Previous
                        </Button>
                    )}
                    {processStep <= 1 && (
                        <Button color="primary" className="me-2" onClick={() => setProcessStep(processStep + 1)}>
                            Next
                        </Button>
                    )}
                    {processStep === 2 && (
                        <RequireAuthentication
                            component={Button}
                            color="primary"
                            className="me-2"
                            onClick={() => {
                                setShowPublishVisualizationDialog(!showPublishVisualizationDialog);
                            }}
                        >
                            Publish
                        </RequireAuthentication>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    );
}

export default AddVisualizationModal;
