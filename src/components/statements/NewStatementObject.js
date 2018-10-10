import React, {Component} from 'react';
import EditToolbar from './EditToolbar';
import {createResourceStatement, createLiteralStatement} from '../../helpers';
import {NotificationManager} from 'react-notifications';
import MainSnak from './MainSnak';

export default class NewStatementObject extends Component {

    state = {
        /* Possible values: 'edit', 'loading'. */
        editorState: 'edit',
        objectType: 'literal',
        selectedPredicateId: null,
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
        NotificationManager.error(error.message, 'Error creating object statement (predicate)', 5000);
    };

    onPublishClick = (event) => {
        const predicateId = this.props.predicateId || this.state.selectedPredicateId;
        switch (this.state.objectType) {
            case 'literal': {
                if (this.value && this.value.length !== 0) {
                    createLiteralStatement(this.props.subjectId, predicateId, this.value,
                        this.onLiteralStatementCreationSuccess, (error) => {
                            this.setEditorState('edit');
                            console.error(error);
                            NotificationManager.error(error.message, 'Error creating resource', 5000);
                        });
                    this.setEditorState('loading');
                }
                break;
            }
            case 'resource': {
                if (this.state.selectedObjectId) {
                    createResourceStatement(this.props.subjectId, predicateId, this.state.selectedObjectId,
                            this.onStatementCreationSuccess, this.onStatementCreationError);
                    this.setEditorState('loading');
                }
                break;
            }
            default: {
                throw `Unknown object type. [this.state.objectType={this.state.objectType}]`;
            }
        }
        return false;
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
        this.setState({selectedPredicateId: predicateId});
    };

    handleObjectSelect = (objectId) => {
        this.setState({selectedObjectId: objectId});
    };

    render() {
        const newProperty = this.props.predicateId === null;
        const editEnabled = !newProperty || this.state.selectedPredicateId;
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
                        onPredicateSelect={this.handlePredicateSelect}/>
                <div className="statementView-qualifiers">
                    <div className="listView"/>
                    <div className="toolbar-container">
                        <span className="toolbar-button toolbar-container">
                                <a href="#" title="">
                                    {
                                        editEnabled && [<span className="fa fa-plus"/>, 'add qualifier']
                                    }
                                </a>
                        </span>
                    </div>
                </div>
            </div>
            <div className="statementView-references-container"/>
            <div className="editToolbar-container toolbar-container">
                <EditToolbar editorState={this.state.editorState} showRemoveButton={false} editEnabled={editEnabled}
                        onPublishClick={this.onPublishClick} onCancelClick={this.props.onCancelClick}/>
            </div>
        </div>
    }

}