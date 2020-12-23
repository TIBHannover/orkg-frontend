import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import CellEditor from 'libs/selfVisModel/RenderingComponents/CellEditor';
import CellSelector from 'libs/selfVisModel/RenderingComponents/CellSelector';
import VisualizationWidget from 'libs/selfVisModel/VisRenderer/VisualizationWidget';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PublishVisualization from './PublishVisualization';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
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

class AddVisualizationModal extends Component {
    constructor(props) {
        super(props);
        this.callingTimeoutCount = 0;
    }

    state = {
        processStep: 0,
        currentlyExporting: false,
        showPublishVisualizationDialog: false
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.showDialog === false && this.props.showDialog === true) {
            if (this.props.useReconstructedData === true) {
                // set the state last tab;
                this.setState({ processStep: 2 });
            } else {
                // reset the model
                new SelfVisDataModel().resetCustomizationModel();
                this.setState({ processStep: 0 });
            }
        }
        if (prevProps.showDialog === true && this.props.showDialog === true) {
            if (prevState.processStep === 0 && this.state.processStep === 2) {
                // this shall trigger the cell validation
                // shall be done when the user switches between select directly to visualize
                new SelfVisDataModel().forceCellValidation(); // singleton call
                new SelfVisDataModel().createGDCDataModel(); // gets the singleton ptr and creates the gdc model
            }
        }
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        // test
        const offset = 250;
        let width = 800;
        // try to find the element int the dom
        const modalBody = document.getElementById('selfVisServiceModalBody');
        if (modalBody) {
            width = modalBody.getBoundingClientRect().width;
        } else {
            // using a timeout to force an update when the modalBody is present and provides its width
            if (this.callingTimeoutCount < 10) {
                setTimeout(setTimeout(this.updateDimensions, 500));
                this.callingTimeoutCount++;
            }
        }

        this.setState({ windowHeight: window.innerHeight - offset, windowWidth: width });
    };

    compareWidth = assumedWidth => {
        const modalBody = document.getElementById('selfVisServiceModalBody');
        if (modalBody) {
            return modalBody.getBoundingClientRect().width;
        }
        return assumedWidth;
    };

    onLoadModal = () => {
        // check if we need to run the parser
        const mmr = new SelfVisDataModel(); // this is a singleton
        mmr.integrateInputData(this.props.initialData);
    };

    setShowPublishVisualizationDialog = val => {
        this.setState({ showPublishVisualizationDialog: val });
    };

    render() {
        return (
            <Modal
                isOpen={this.props.showDialog}
                toggle={this.props.toggle}
                size="lg"
                onOpened={() => {
                    this.onLoadModal();
                    this.setState({ loadedModel: true });
                }}
                style={{ maxWidth: '90%', marginBottom: 0 }}
            >
                <ModalHeader toggle={this.props.toggle}>Create visualization of comparison table</ModalHeader>
                <ModalBody id="selfVisServiceModalBody">
                    <TabButtons>
                        {/*  TAB BUTTONS*/}
                        <TabButton
                            active={this.state.processStep === 0 ? true : false}
                            onClick={() => {
                                this.setState({ processStep: 0 });
                            }}
                        >
                            Select
                        </TabButton>
                        <TabButton
                            active={this.state.processStep === 1 ? true : false}
                            onClick={() => {
                                this.setState({ processStep: 1 });
                            }}
                        >
                            Map &amp; Edit
                        </TabButton>
                        <TabButton
                            active={this.state.processStep === 2 ? true : false}
                            onClick={() => {
                                this.setState({ processStep: 2 });
                            }}
                        >
                            Visualize
                        </TabButton>
                    </TabButtons>
                    {/*  renders different views based on the current step in the process*/}
                    {this.state.processStep === 0 && <CellSelector isLoading={!this.state.loadedModel} height={this.state.windowHeight - 50} />}
                    {this.state.processStep === 1 && <CellEditor isLoading={!this.state.loadedModel} height={this.state.windowHeight - 50} />}
                    {this.state.processStep === 2 && (
                        <VisualizationWidget
                            isLoading={!this.state.loadedModel}
                            height={this.state.windowHeight - 10}
                            width={this.state.windowWidth}
                            comparePropsWithActualWidth={this.compareWidth}
                        />
                    )}

                    <PublishVisualization
                        showDialog={this.state.showPublishVisualizationDialog}
                        toggle={() => this.setShowPublishVisualizationDialog(!this.state.showPublishVisualizationDialog)}
                        closeAllAndReloadVisualizations={() => {
                            this.setShowPublishVisualizationDialog(!this.state.showPublishVisualizationDialog);
                            this.props.toggle();
                            this.props.updatePreviewComponent();
                        }}
                        comparisonId={this.props.initialData.metaData.id}
                    />
                </ModalBody>
                <ModalFooter className="p-2">
                    <div className="d-flex justify-content-end">
                        {this.state.processStep === 0 && (
                            <Button
                                color="primary"
                                className="mr-2"
                                onClick={() => {
                                    this.setState({ processStep: this.state.processStep + 1 });
                                }}
                            >
                                Next
                            </Button>
                        )}
                        {this.state.processStep === 1 && (
                            <>
                                <Button
                                    color="primary"
                                    className="mr-2"
                                    onClick={() => {
                                        this.setState({ processStep: this.state.processStep - 1 });
                                    }}
                                >
                                    Prev
                                </Button>
                                <Button
                                    color="primary"
                                    className="mr-2"
                                    onClick={() => {
                                        this.setState({ processStep: this.state.processStep + 1 });
                                    }}
                                >
                                    Next
                                </Button>
                            </>
                        )}
                        {this.state.processStep === 2 && (
                            <>
                                <Button
                                    color="primary"
                                    className="mr-2"
                                    onClick={() => {
                                        this.setState({ processStep: this.state.processStep - 1 });
                                    }}
                                >
                                    Prev
                                </Button>
                                {this.props.initialData.metaData.id && (
                                    <RequireAuthentication
                                        component={Button}
                                        color="primary"
                                        className="mr-2"
                                        disabled={this.state.currentlyExporting}
                                        onClick={() => {
                                            this.setShowPublishVisualizationDialog(!this.state.showPublishVisualizationDialog);
                                        }}
                                    >
                                        {this.state.currentlyExporting ? (
                                            <>
                                                <Icon icon={faSpinner} spin className="mr-1 align-self-center" /> Exporting
                                            </>
                                        ) : (
                                            <>Export</>
                                        )}
                                    </RequireAuthentication>
                                )}

                                {!this.props.initialData.metaData.id && (
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
}

AddVisualizationModal.propTypes = {
    useReconstructedData: PropTypes.bool.isRequired,
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    updatePreviewComponent: PropTypes.func.isRequired,
    initialData: PropTypes.object
};

export default AddVisualizationModal;
