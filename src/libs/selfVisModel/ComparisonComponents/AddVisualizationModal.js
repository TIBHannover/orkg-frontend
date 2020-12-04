import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import SelfVisDataModel from '../SelfVisDataModel';

import styled from 'styled-components';
import CellEditor from '../RenderingComponents/CellEditor';
import CellSelector from '../RenderingComponents/CellSelector';
import VisualizationWidget from '../VisRenderer/VisualizationWidget';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import { openAuthDialog } from '../../../actions/auth';
import { connect } from 'react-redux';
import RequireAuthentication from '../../../components/RequireAuthentication/RequireAuthentication';
import PublishVisualization from './PublishVisualization';

const TabButton = styled.div`
    cursor: pointer;
    color: #000000;
    padding: 4px 20px 4px 20px;
    border-right: 2px solid #black;
    border-radius: 10px;
    margin: 0 0;
    background-color: #f8f9fb;
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
    border: 1px solid #dbdde5;
    border-bottom: none;
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
                <ModalHeader toggle={this.props.toggle} style={{ width: '100%' }}>
                    <div style={{ height: '60px', width: '800px' }}>
                        <div style={{ width: '100%', height: '40px', paddingTop: '5px' }}>Create visualization of comparision table</div>
                        <div style={{ flexDirection: 'row', display: 'flex', flexGrow: '1', marginLeft: '-15px', height: '36px' }}>
                            {/*  TAB BUTTONS*/}
                            <TabButton
                                style={{
                                    marginLeft: '5px',
                                    borderTopRightRadius: '0',
                                    borderRight: '0px',
                                    backgroundColor: this.state.processStep === 0 ? '#e86161' : '',
                                    border: this.state.processStep === 0 ? 'none' : '',
                                    color: this.state.processStep === 0 ? '#ffffff' : ''
                                }}
                                onClick={() => {
                                    this.setState({ processStep: 0 });
                                }}
                            >
                                Select
                            </TabButton>
                            <TabButton
                                style={{
                                    borderRadius: '0',
                                    backgroundColor: this.state.processStep === 1 ? '#e86161' : '',
                                    color: this.state.processStep === 1 ? '#ffffff' : '',
                                    border: this.state.processStep === 1 ? 'none' : ''
                                }}
                                onClick={() => {
                                    this.setState({ processStep: 1 });
                                }}
                            >
                                Map & Edit
                            </TabButton>
                            <TabButton
                                style={{
                                    borderTopLeftRadius: '0',
                                    borderLeft: '0px',
                                    backgroundColor: this.state.processStep === 2 ? '#e86161' : '',
                                    color: this.state.processStep === 2 ? '#ffffff' : '',
                                    border: this.state.processStep === 2 ? 'none' : ''
                                }}
                                onClick={() => {
                                    this.setState({ processStep: 2 });
                                }}
                            >
                                Visualize
                            </TabButton>
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody id="selfVisServiceModalBody" style={{ padding: '0', minHeight: '100px', height: this.state.windowHeight }}>
                    {/*  renders different views based on the current step in the process*/}
                    {this.state.processStep === 0 && this.props.showDialog && (
                        <CellSelector isLoading={!this.state.loadedModel} height={this.state.windowHeight - 50} />
                    )}
                    {this.state.processStep === 1 && this.props.showDialog && (
                        <CellEditor isLoading={!this.state.loadedModel} height={this.state.windowHeight - 50} />
                    )}
                    {this.state.processStep === 2 && this.props.showDialog && (
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
                    {this.state.processStep === 0 && this.props.showDialog && (
                        <Button
                            color="primary"
                            style={{ float: 'right', margin: '2px' }}
                            onClick={() => {
                                this.setState({ processStep: this.state.processStep + 1 });
                            }}
                        >
                            Next
                        </Button>
                    )}
                    {this.state.processStep === 1 && this.props.showDialog && (
                        <>
                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '2px' }}
                                onClick={() => {
                                    this.setState({ processStep: this.state.processStep - 1 });
                                }}
                            >
                                Prev
                            </Button>
                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '2px' }}
                                onClick={() => {
                                    this.setState({ processStep: this.state.processStep + 1 });
                                }}
                            >
                                Next
                            </Button>
                        </>
                    )}
                    {this.state.processStep === 2 && this.props.showDialog && (
                        <>
                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '2px' }}
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
                                    style={{ float: 'right', margin: '2px' }}
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
                                // Faked the button as a span (Tippy does not like Buttons oO )
                                <span style={{ float: 'right', margin: '10px', marginTop: '17px', marginLeft: '5px' }}>
                                    <Tippy content="Can not export visualization to a temporal comparison. Please publish comparison first.">
                                        <span
                                            style={{
                                                marginTop: '10px',

                                                color: '#fff',
                                                backgroundColor: '#959796',
                                                borderColor: '#e86161',
                                                padding: '0.45rem 30px',
                                                fontSize: '1rem',
                                                lineHeight: '1.5',
                                                fontWeight: '400',
                                                textAlign: 'center',
                                                borderRadius: '6px',
                                                userSelect: 'none'
                                            }}
                                        >
                                            Export
                                        </span>
                                    </Tippy>
                                </span>
                            )}
                        </>
                    )}
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
    closeOnExport: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.any
};

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: (action, signInRequired) => dispatch(openAuthDialog(action, signInRequired))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddVisualizationModal);
