import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import SelfVisDataModel from '../../libs/selfVisModel/SelfVisDataModel';
// import styled from 'styled-components';

// TODO: investigate performance, somehow it takes way to long to render the modal (like 800ms) -- oO --
import styled from 'styled-components';
import CellEditor from '../../libs/selfVisModel/RenderingComponents/CellEditor';
import CellSelector from '../../libs/selfVisModel/RenderingComponents/CellSelector';
import VisualizationWidget from '../../libs/selfVisModel/VisRenderer/VisualizationWidget';
import { getStatementsBySubject, createLiteralStatement, createResourceStatement } from '../../services/backend/statements';
import { createLiteral } from '../../services/backend/literals';
import { createResource } from '../../services/backend/resources';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import { openAuthDialog } from '../../actions/auth';
import { connect } from 'react-redux';
import RequireAuthentication from '../RequireAuthentication/RequireAuthentication';

const TabButton = styled.div`
    cursor: pointer;
    color: #000000;
    padding: 4px 20px 4px 20px;
    border-right: 2px solid #black;
    border-radius: 10px;
    margin: 0 3px;
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
        currentlyExporting: false
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentDidUpdate = prevProps => {};

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        // test
        const offset = 28 * 2 + 85;
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

    onLoadModal = () => {
        // check if we need to run the parser
        const mmr = new SelfVisDataModel(); // this is a singleton
        mmr.integrateInputData(this.props.initialData);
    };

    createDataOnBackend = data => {
        console.log(this.props.initialData);
        const comparisonId = this.props.initialData.metaData.id;
        // check if there is a metaVisNode
        getStatementsBySubject({ id: comparisonId }).then(comparisionStatements => {
            // test:
            const metaStatements = comparisionStatements.find(statement => statement.object.classes && statement.object.classes.includes('C11019'));
            if (!metaStatements) {
                createResource('MetaVisualizationCollection', ['C11019']).then(res => {
                    // we need not to create a resource statement on the comparision;
                    createResourceStatement(comparisonId, 'P30026', res.id).then(() => {
                        const subjectId = res.id;
                        const predicateId = 'P30027'; // << FIXED    resolves to "HasMetaVisualizationDefinition"
                        createLiteral(JSON.stringify(data)).then(res => {
                            const literalId = res.id;
                            // create literal statement;
                            createLiteralStatement(subjectId, predicateId, literalId).then(() => {
                                // WE HAVE CREATED EVERYTHING, NOW WE CAN CLOSE THE MODEL
                                this.setState({ currentlyExporting: false });
                                this.props.closeOnExport();
                            });
                        });
                    });
                });
            } else {
                const metaNodeId = metaStatements.object.id;
                getStatementsBySubject({ id: metaNodeId }).then(metaInformationStatements => {
                    const subjectId = metaNodeId;
                    const predicateId = 'P30027'; // << FIXED    resolves to "HasMetaVisualizationDefinition"
                    createLiteral(JSON.stringify(data)).then(res => {
                        const literalId = res.id;
                        // create literal statement;
                        createLiteralStatement(subjectId, predicateId, literalId).then(() => {
                            // WE HAVE CREATED EVERYTHING, NOW WE CAN CLOSE THE MODEL
                            this.setState({ currentlyExporting: false });
                            this.props.closeOnExport();
                        });
                    });
                });
            }
        });
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
                        {/*todo : make window size adjustments! */}
                        <div style={{ width: '100%', height: '40px', paddingTop: '5px' }}>Create visualization of comparision table</div>
                        <div style={{ flexDirection: 'row', display: 'flex', flexGrow: '1', marginLeft: '-15px', height: '36px' }}>
                            {/*  TAB BUTTONS*/}

                            <TabButton
                                style={{
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
                    {/*  Should render different views based on the current step in the process*/}
                    {/*    For Now we render the selection Table */}
                    {this.state.processStep === 0 && this.props.showDialog && (
                        <>
                            <CellSelector isLoading={!this.state.loadedModel} height={this.state.windowHeight - 50} />
                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '7px' }}
                                onClick={() => {
                                    this.setState({ processStep: this.state.processStep + 1 });
                                }}
                            >
                                Next
                            </Button>
                        </>
                    )}
                    {this.state.processStep === 1 && (
                        <>
                            <CellEditor isLoading={!this.state.loadedModel} height={this.state.windowHeight - 50} />
                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '7px' }}
                                onClick={() => {
                                    this.setState({ processStep: this.state.processStep + 1 });
                                }}
                            >
                                Next
                            </Button>
                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '7px' }}
                                onClick={() => {
                                    this.setState({ processStep: this.state.processStep - 1 });
                                }}
                            >
                                Prev
                            </Button>
                        </>
                    )}
                    {this.state.processStep === 2 && (
                        <>
                            <VisualizationWidget
                                isLoading={!this.state.loadedModel}
                                height={this.state.windowHeight - 50}
                                width={this.state.windowWidth}
                            />
                            {this.props.initialData.metaData.id && (
                                <RequireAuthentication
                                    component={Button}
                                    color="primary"
                                    style={{ float: 'right', margin: '7px' }}
                                    disabled={this.state.currentlyExporting}
                                    onClick={() => {
                                        this.setState({ currentlyExporting: true });
                                        const currModel = new SelfVisDataModel();
                                        //collect Data
                                        const metaVisData = {};
                                        metaVisData.renderingEngine = currModel._renderingEngine;
                                        metaVisData.visMethod = currModel._renderingMethod;
                                        metaVisData.reconstructionData = currModel.getReconstructionModel();
                                        console.log(JSON.stringify(metaVisData));
                                        console.log('THIS IS THE DATE THAT WE DO FOR RECONSTRUCTION!');
                                        // this.createDataOnBackend(metaVisData);
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

                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '7px' }}
                                onClick={() => {
                                    const currModel = new SelfVisDataModel();
                                    //collect Data
                                    console.log(currModel.getReconstructionModel());
                                }}
                            >
                                Test MODEL
                            </Button>

                            <Button
                                color="primary"
                                style={{ float: 'right', margin: '7px' }}
                                onClick={() => {
                                    this.setState({ processStep: this.state.processStep - 1 });
                                }}
                            >
                                Prev
                            </Button>
                        </>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

AddVisualizationModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
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
