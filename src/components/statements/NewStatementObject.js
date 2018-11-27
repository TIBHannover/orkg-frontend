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
import {popupDelay} from '../../utils';

export default class NewStatementObject extends Component {

    state = {
        /* Possible valhttp://10.115.83.128:3000/ues: 'edit', 'loading'. */
        editorState: 'edit',
        objectType: 'resource',
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
        NotificationManager.success('Literal statement created successfully', 'Success', popupDelay);
        this.props.onPublishSuccess(responseJson.object.label);
    };

    onStatementCreationSuccess = (responseJson) => {
        this.setEditorState('edit');
        NotificationManager.success('Object statement created successfully', 'Success', popupDelay);
        this.props.onPublishSuccess(responseJson.object.label);
    };

    onStatementCreationError = (error) => {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating object statement', popupDelay);
    };

    onPredicateCreationSuccess = async (responseJson) => {
        await this.createStatement(responseJson.id);
    };

    onPredicateCreationError = (error) => {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating predicate', popupDelay);
    };

    getResourceCreationHandler = (predicateId) => {
        return async (responseJson) => {
            this.setEditorState('edit');
            NotificationManager.success('Resource created successfully', 'Success', popupDelay);

            try {
                const responseJson1 = await createResourceStatement(this.props.subjectId, predicateId, responseJson.id);
                this.onStatementCreationSuccess(responseJson1);
            } catch (e) {
                this.onStatementCreationError(e);
            }
        };
    };

    handleResourceCreationError = (error) => {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating object statement', popupDelay);
    };

    handlePublishClick = async () => {
        const predicateId = this.props.predicate !== null ? this.props.predicate.id : this.state.selectedPredicateId;
        const newPredicateLabel = this.state.newPredicateLabel;

        if (!predicateId && newPredicateLabel) {
            try {
                const responseJson = await createPredicate(newPredicateLabel);
                await this.onPredicateCreationSuccess(responseJson);
            } catch (e) {
                this.onPredicateCreationError(e);
            }
        } else {
            await this.createStatement(predicateId);
        }
    };

    getLiteralCreationSuccessHandler = (predicateId) => {
        return async (responseJson) => {
            console.log(`Inner function is called. [predicateId=${predicateId}, responseJson=${responseJson}]`);
            try {
                const responseJson1 = await createLiteralStatement(this.props.subjectId, predicateId, responseJson.id);
                NotificationManager.success('Literal created successfully', 'Success', popupDelay);
                this.onLiteralStatementCreationSuccess(responseJson1);
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                NotificationManager.error(error.message, 'Error creating literal statement', popupDelay);
            }
        };
    };

    createStatement = async (predicateId) => {
        switch (this.state.objectType) {
            case 'literal': {
                if (this.value && this.value.length !== 0) {
                    this.setEditorState('loading');

                    try {
                        const responseJson = await createLiteral(this.value);
                        await this.getLiteralCreationSuccessHandler(predicateId)(responseJson);
                    } catch (error) {
                        this.setEditorState('edit');
                        console.error(error);
                        NotificationManager.error(error.message, 'Error creating literal', popupDelay);
                    }
                }
                break;
            }
            case 'resource': {
                if (this.state.selectedObjectId) {
                    try {
                        const responseJson = await createResourceStatement(this.props.subjectId, predicateId,
                                this.state.selectedObjectId);
                        this.onStatementCreationSuccess(responseJson);
                    } catch (e) {
                        this.onStatementCreationError(e);
                    }
                } else {
                    try {
                        const responseJson = await createResource(this.value);
                        await (this.getResourceCreationHandler(predicateId))(responseJson);
                    } catch (e) {
                        this.handleResourceCreationError(e);
                    }
                }
                this.setEditorState('loading');
                break;
            }
            default: {
                throw new Error(`Unknown object type. [this.state.objectType=${this.state.objectType}]`);
            }
        }
    };

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

    handleKeyDown = async (event) => {
        switch (event.keyCode) {
            case 13: {
                await this.handlePublishClick();
                return false;
            }
            case 27: {
                this.props.onCancelClick(event);
                return false;
            }
            default: {
                break;
            }
        }
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
                        onNewPredicate={this.handleNewPredicate}
                        onKeyDown={this.handleKeyDown}/>
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
