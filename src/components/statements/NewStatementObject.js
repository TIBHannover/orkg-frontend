import React, {Component, Fragment} from 'react';
import EditToolbar from './EditToolbar';
import {
    createLiteral,
    createLiteralStatement,
    createPredicate,
    createResource,
    createResourceStatement
} from '../../network';
import {NotificationManager} from 'react-notifications';
import MainSnak from './MainSnak';
import {Button} from 'reactstrap';

export default class NewStatementObject extends Component {

    state = {
        /* Possible values: 'edit', 'loading'. */
        editorState: 'edit',
        objectType: 'literal',
        selectedPredicateId: null,
        newPredicateLabel: null,
        selectedObjectId: null,
    };

    value = null;

    constructor(props) {
        super(props);

        this.value = this.props.value;
    }

    onLiteralStatementCreationSuccess = (responseJson) => {
        this.setEditorState('edit');
        NotificationManager.success('Literal statement created successfully', 'Success', 5000);
        this.props.onPublishSuccess(responseJson.label);
    };

    onStatementCreationSuccess = (responseJson) => {
        this.setEditorState('edit');
        NotificationManager.success('Object statement created successfully', 'Success', 5000);
        this.props.onPublishSuccess(responseJson.label);
    };

    onStatementCreationError = (error) => {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating object statement', 5000);
    };

    onPredicateCreationSuccess = (responseJson) => {
        this.createStatement(responseJson.id);
    };

    onPredicateCreationError = (error) => {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating predicate', 5000);
    };

    getResourceCreationHandler = (predicateId) => {
        const that = this;
        return (responseJson) => {
            this.setEditorState('edit');
            NotificationManager.success('Resource created successfully', 'Success', 5000);

            createResourceStatement(that.props.subjectId, predicateId, responseJson.id,
                    that.onStatementCreationSuccess, that.onStatementCreationError);
        };
    };

    handleResourceCreationError = (error) => {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating object statement', 5000);
    };

    handlePublishClick = () => {
        const predicateId = this.props.predicate !== null ? this.props.predicate.id : this.state.selectedPredicateId;
        const newPredicateLabel = this.state.newPredicateLabel;

        if (!predicateId && newPredicateLabel) {
            createPredicate(newPredicateLabel, this.onPredicateCreationSuccess, this.onPredicateCreationError);
        } else {
            this.createStatement(predicateId);
        }
    };

    getLiteralCreationSuccessHandler = (predicateId) => {
        return (responseJson) => {
            createLiteralStatement(this.props.subjectId, predicateId, responseJson.id,
                    this.onLiteralStatementCreationSuccess, (error) => {
                        this.setEditorState('edit');
                        console.error(error);
                        NotificationManager.error(error.message, 'Error creating literal statement', 5000);
                    });
        }
    };

    createStatement(predicateId) {
        switch (this.state.objectType) {
            case 'literal': {
                if (this.value && this.value.length !== 0) {
                    createLiteral(this.value, this.getLiteralCreationSuccessHandler(predicateId), (error) => {
                        this.setEditorState('edit');
                        console.error(error);
                        NotificationManager.error(error.message, 'Error creating literal', 5000);
                    });
                    this.setEditorState('loading');
                }
                break;
            }
            case 'resource': {
                if (this.state.selectedObjectId) {
                    createResourceStatement(this.props.subjectId, predicateId, this.state.selectedObjectId,
                            this.onStatementCreationSuccess, this.onStatementCreationError);
                } else {
                    createResource(this.value, this.getResourceCreationHandler(predicateId),
                            this.handleResourceCreationError);
                }
                this.setEditorState('loading');
                break;
            }
            default: {
                throw new Error(`Unknown object type. [this.state.objectType=${this.state.objectType}]`);
            }
        }
    }

    setEditorState(editorState) {
        this.setState({editorState: editorState});
    }

    onValueChange = (event) => {
        this.value = event.target.value.trim();
    };

    handleObjectTypeSelect = (itemName) => {
        this.setState({
            objectType: itemName
        });
    };

    handlePredicateSelect = (predicateId) => {
        this.setState({
            newPredicateLabel: null,
            selectedPredicateId: predicateId,
        });
    };

    handleNewPredicate = (newPredicateLabel) => {
        this.setState({
            newPredicateLabel: newPredicateLabel,
            selectedPredicateId: null,
        });
    };

    handleObjectSelect = (objectId) => {
        this.setState({selectedObjectId: objectId});
    };

    render() {
        const newProperty = this.props.predicate === null;
        const editEnabled = !newProperty || this.state.selectedPredicateId !== null
                || this.state.newPredicateLabel !== null;
        return <div id="new" className="statementView newStatement">
            <div className="statementView-rankSelector">
                <div className="rankSelector">
                    <span className="fa fa-sort"/>
                </div>
            </div>
            <div className="statementView-mainSnak-container">
                <MainSnak editing={true} text="" onInput={this.onValueChange}
                        onObjectTypeSelect={this.handleObjectTypeSelect}
                        objectType={this.state.objectType}
                        newProperty={newProperty}
                        onObjectSelect={this.handleObjectSelect}
                        onPredicateSelect={this.handlePredicateSelect}
                        onNewPredicate={this.handleNewPredicate}/>
                <div className="statementView-qualifiers">
                    <div className="listView"/>
                    <div className="toolbar-container hidden">
                        <span className="toolbar-button toolbar-container">
                                <Button>
                                    {
                                        editEnabled && <Fragment><span className="fa fa-plus"/>add qualifier</Fragment>
                                    }
                                </Button>
                        </span>
                    </div>
                </div>
            </div>
            <div className="statementView-references-container"/>
            <div className="editToolbar-container toolbar-container">
                <EditToolbar editorState={this.state.editorState} showRemoveButton={false} editEnabled={editEnabled}
                        onPublishClick={this.handlePublishClick} onCancelClick={this.props.onCancelClick}/>
            </div>
        </div>
    }

}
