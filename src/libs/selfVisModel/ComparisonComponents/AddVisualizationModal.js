import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import CellEditor from 'libs/selfVisModel/RenderingComponents/CellEditor';
import CellSelector from 'libs/selfVisModel/RenderingComponents/CellSelector';
import VisualizationWidget from 'libs/selfVisModel/VisRenderer/VisualizationWidget';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PublishVisualization from './PublishVisualization';
import { usePrevious } from 'react-use';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const TabButtons = styled(Row)`
    border-bottom: 2px solid ${props => props.theme.ultraLightBlueDarker};
`;

const TabButton = styled.div`
    cursor: pointer;
    padding: 4px 20px;
    background-color: ${props => (props.active ? props.theme.primary : props.theme.themeColors.lightblue)};
    border: ${props => (props.active ? 'none' : '1px solid ' + props.theme.ultraLightBlueDarker)};
    border-bottom: 0;
    color: ${props => (props.active ? '#ffffff' : '')};
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

function AddVisualizationModal(props) {
    const [callingTimeoutCount, setCallingTimeoutCount] = useState(0);
    const [processStep, setProcessStep] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [loadedModel, setLoadedModel] = useState(null);
    const [showPublishVisualizationDialog, setShowPublishVisualizationDialog] = useState(false);
    const prevProcessStep = usePrevious(processStep);
    const prevShowDialog = usePrevious(props.showDialog);

    useEffect(() => {
        const updateDimensions = () => {
            // test
            const offset = 300;
            let width = 800;
            // try to find the element int the dom
            const modalBody = document.getElementById('selfVisServiceModalBody');
            if (modalBody) {
                width = modalBody.getBoundingClientRect().width;
            } else {
                // using a timeout to force an update when the modalBody is present and provides its width
                if (callingTimeoutCount < 10) {
                    setTimeout(setTimeout(updateDimensions, 500));
                    setCallingTimeoutCount(callingTimeoutCount + 1);
                }
            }
            setWindowHeight(window.innerHeight - offset);
            setWindowWidth(width);
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (props.showDialog) {
            if (!prevShowDialog) {
                if (props.useReconstructedData) {
                    // set the state last tab;
                    setProcessStep(2);
                } else {
                    // reset the model
                    new SelfVisDataModel().resetCustomizationModel();
                    setProcessStep(0);
                }
            } else {
                if (prevProcessStep === 0 && processStep === 2) {
                    // this shall trigger the cell validation
                    // shall be done when the user switches between select directly to visualize
                    new SelfVisDataModel().forceCellValidation(); // singleton call
                    new SelfVisDataModel().createGDCDataModel(); // gets the singleton ptr and creates the gdc model
                }
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.showDialog, processStep]);

    const compareWidth = assumedWidth => {
        const modalBody = document.getElementById('selfVisServiceModalBody');
        if (modalBody) {
            return modalBody.getBoundingClientRect().width;
        }
        return assumedWidth;
    };

    const onLoadModal = () => {
        // check if we need to run the parser
        const mmr = new SelfVisDataModel(); // this is a singleton
        mmr.integrateInputData(props.initialData);
    };

    return (
        <Modal
            isOpen={props.showDialog}
            toggle={props.toggle}
            size="lg"
            onOpened={() => {
                onLoadModal();
                setLoadedModel(true);
            }}
            style={{ maxWidth: '90%', marginBottom: 0 }}
        >
            <ModalHeader toggle={props.toggle}>Create visualization of comparison table</ModalHeader>
            <ModalBody id="selfVisServiceModalBody">
                <TabButtons>
                    {/*  TAB BUTTONS*/}
                    <TabButton active={processStep === 0} onClick={() => setProcessStep(0)}>
                        Select
                    </TabButton>
                    <TabButton active={processStep === 1} onClick={() => setProcessStep(1)}>
                        Map &amp; Edit
                    </TabButton>
                    <TabButton active={processStep === 2} onClick={() => setProcessStep(2)}>
                        Visualize
                    </TabButton>
                </TabButtons>
                {/*  renders different views based on the current step in the process*/}
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

                <PublishVisualization
                    showDialog={showPublishVisualizationDialog}
                    toggle={() => setShowPublishVisualizationDialog(!showPublishVisualizationDialog)}
                    closeAllAndReloadVisualizations={() => {
                        setShowPublishVisualizationDialog(!showPublishVisualizationDialog);
                        props.toggle();
                        props.updatePreviewComponent();
                    }}
                    comparisonId={props.initialData.metaData.id}
                />
            </ModalBody>
            <ModalFooter className="p-2">
                <div className="d-flex justify-content-end">
                    {processStep > 0 && (
                        <Button color="primary" className="mr-2" onClick={() => setProcessStep(processStep - 1)}>
                            Prev
                        </Button>
                    )}
                    {processStep <= 1 && (
                        <Button color="primary" className="mr-2" onClick={() => setProcessStep(processStep + 1)}>
                            Next
                        </Button>
                    )}
                    {processStep === 2 && (
                        <>
                            {props.initialData.metaData.id && (
                                <RequireAuthentication
                                    component={Button}
                                    color="primary"
                                    className="mr-2"
                                    onClick={() => {
                                        setShowPublishVisualizationDialog(!showPublishVisualizationDialog);
                                    }}
                                >
                                    Export
                                </RequireAuthentication>
                            )}

                            {!props.initialData.metaData.id && (
                                <Tippy
                                    hideOnClick={false}
                                    content="Can not export visualization to a temporal comparison. Please publish comparison first."
                                >
                                    <span className="btn btn-primary disabled">Export</span>
                                </Tippy>
                            )}
                        </>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    );
}

AddVisualizationModal.propTypes = {
    useReconstructedData: PropTypes.bool.isRequired,
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    updatePreviewComponent: PropTypes.func.isRequired,
    initialData: PropTypes.object
};

export default AddVisualizationModal;
