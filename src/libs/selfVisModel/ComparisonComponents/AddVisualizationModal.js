import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import CellEditor from 'libs/selfVisModel/RenderingComponents/CellEditor';
import CellSelector from 'libs/selfVisModel/RenderingComponents/CellSelector';
import VisualizationWidget from 'libs/selfVisModel/VisRenderer/VisualizationWidget';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PublishVisualization from './PublishVisualization';
import SVSVideoModal from './VideoModal';
import { usePrevious } from 'react-use';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestion, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';

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

const EmbeddedContainer = styled.div`
    box-sizing: border-box;
    margin: 25px;
    position: fixed;
    white-space: nowrap;
    z-index: 9998;
    padding-left: 0;
    list-style: none;
    padding: 0;
    bottom: 16px;
    right: 24px;
    color: #80869b;

    .text {
        cursor: pointer;
        display: inline-block;
        margin-left: 8px;
        font-weight: bold;
        line-height: 56px;
        font-size: large;
    }

    .white {
        color: #fff;
    }
`;

const HelpIcon = styled(Icon)`
    vertical-align: middle;
    height: 30px;
    width: 30px !important;
    z-index: 9999;
    background-color: ${props => props.theme.orkgPrimaryColor};
    display: inline-flex;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
    position: relative;
    border: none;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.28);
    cursor: pointer;
    outline: none;
    padding: 6px;
    -webkit-user-drag: none;
    font-weight: bold;
    color: #f1f1f1;
    font-size: 18px;
`;

function AddVisualizationModal(props) {
    const [callingTimeoutCount, setCallingTimeoutCount] = useState(0);
    const [processStep, setProcessStep] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [loadedModel, setLoadedModel] = useState(false);
    const [showPublishVisualizationDialog, setShowPublishVisualizationDialog] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showVideoModalEmbedded, setShowVideoModalEmbedded] = useState(false);

    const prevProcessStep = usePrevious(processStep);
    const prevShowDialog = usePrevious(props.showDialog);

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

    const hybridUpdate = () => {
        setCallingTimeoutCount(9);
        setTimeout(setTimeout(updateDimensions, 50));
    };

    useEffect(() => {
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
        <>
            <Modal
                isOpen={props.showDialog}
                toggle={props.toggle}
                size="lg"
                onOpened={() => {
                    onLoadModal();
                    setLoadedModel(true);
                }}
                style={{ maxWidth: showVideoModalEmbedded ? '65%' : '90%', marginBottom: 0, marginLeft: showVideoModalEmbedded ? '5%' : '' }}
            >
                <ModalHeader toggle={props.toggle}>
                    Create comparison visualization
                    <div
                        style={{ display: 'inline', marginLeft: '5px' }}
                        onClick={() => {
                            setShowVideoModal(!showVideoModal);
                        }}
                        id="helpIcon"
                    >
                        <HelpIcon icon={faQuestion} />
                    </div>
                    <div
                        style={{ display: 'inline', marginLeft: '5px' }}
                        onClick={() => {
                            setShowVideoModalEmbedded(!showVideoModalEmbedded);
                            hybridUpdate();
                        }}
                        id="helpIcon"
                    >
                        <HelpIcon icon={faProjectDiagram} />
                    </div>
                </ModalHeader>
                <ModalBody id="selfVisServiceModalBody">
                    <TabButtons>
                        {/*  TAB BUTTONS*/}
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

                    {/*Version one */}
                    <SVSVideoModal
                        showDialog={showVideoModal}
                        toggle={() => setShowVideoModal(!showVideoModal)}
                        width={windowWidth}
                        height={windowHeight + 130}
                    />

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
                    {/*Added hint to select at least one mapper at the top*/}
                    {processStep === 1 && (
                        <div style={{ position: 'absolute', left: 0 }}>Please select at least one mapper at the top of a column.</div>
                    )}
                    <div className="d-flex justify-content-end">
                        {processStep > 0 && (
                            <Button color="light" className="mr-2" onClick={() => setProcessStep(processStep - 1)}>
                                Previous
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
                                        Publish
                                    </RequireAuthentication>
                                )}

                                {!props.initialData.metaData.id && (
                                    <Tippy
                                        hideOnClick={false}
                                        content="Cannot publish visualization to a unpublished comparison. You must publish the comparison first."
                                    >
                                        <span className="btn btn-primary disabled">Publish</span>
                                    </Tippy>
                                )}
                            </>
                        )}
                    </div>
                </ModalFooter>
            </Modal>
            {showVideoModalEmbedded && (
                <EmbeddedContainer style={{ width: '25%' }}>
                    <div className="modal-content">
                        <ModalHeader toggle={() => setShowVideoModalEmbedded(!showVideoModalEmbedded)}>
                            Self Visualization Service Instruction Video
                        </ModalHeader>
                        <ModalBody>
                            <div className="embed-responsive embed-responsive-16by9" style={{ height: windowHeight + 130 }}>
                                <iframe
                                    title="How to make an ORKG comparison"
                                    scrolling="no"
                                    frameBorder="0"
                                    src="//av.tib.eu/player/51996"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen={true}
                                    className="embed-responsive-item"
                                />
                            </div>
                        </ModalBody>
                    </div>
                </EmbeddedContainer>
            )}
        </>
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
