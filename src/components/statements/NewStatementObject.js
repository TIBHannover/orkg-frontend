import React, {Component} from 'react';
import EditToolbar from './EditToolbar';
import {createResource, createResourceStatement, createLiteralStatement} from '../../helpers';
import {NotificationManager} from 'react-notifications';
import MainSnak from './MainSnak';

export default class NewStatementObject extends Component {

    state = {
        /* Possible values: 'edit', 'loading'. */
        editorState: 'edit',
        objectType: 'literal',
    };

    value = null;

    constructor(props) {
        super(props);

        this.value = this.props.text;
    }

    onLiteralStatementCreationSuccess = (responseJson) => {
        this.setEditorState('edit');
        NotificationManager.success('Statement created successfully', 'Success', 5000);
        this.props.onPublishSuccess(responseJson.label);
    };

    onResourceCreationSuccess = (responseJson) => {
        this.setEditorState('edit');
        NotificationManager.success('Resource added successfully', 'Success', 5000);
        this.props.onPublishSuccess(responseJson.label);
    };

    onResourceCreationError = (error) => {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating resource statement (predicate)', 5000);
    };

    onPublishClick = (event) => {
        if (this.value && this.value.length !== 0) {
            switch (this.state.objectType) {
                case 'literal': {
                    createLiteralStatement(this.props.subjectId, this.props.predicateId, this.value,
                            this.onLiteralStatementCreationSuccess, (error) => {
                                this.setEditorState('edit');
                                console.error(error);
                                NotificationManager.error(error.message, 'Error creating resource', 5000);
                            });
                    break;
                }
                case 'resource': {
                    createResource(this.value, (responseJson) => {
                            createResourceStatement(this.props.subjectId, this.props.predicateId, responseJson.id,
                                    this.onResourceCreationSuccess, this.onResourceCreationError);
                        },
                        (error) => {
                            this.setEditorState('edit');
                            console.error(error);
                            NotificationManager.error(error.message, 'Error creating resource', 5000);
                        });
                    break;
                }
                default: {
                    throw `Unknown object type. [this.state.objectType={this.state.objectType}]`;
                    break;
                }
            }
            this.setEditorState('loading');
        }
        return false;
    };

    setEditorState(editorState) {
        this.setState({editorState: editorState});
    }

    onValueChange(event) {
        this.value = event.target.value.trim();
    }

    handleObjectTypeSelect = (itemName) => {
        this.setState({
            objectType: itemName
        });
    };

    render() {
        return <div id="new" className="statementView newStatement">
            <div className="statementView-rankSelector">
                <div className="rankSelector">
                    <span className="fa fa-sort"/>
                </div>
            </div>
            <div className="statementView-mainSnak-container">
                <MainSnak editing={true} text="" onInput={this.onValueChange.bind(this)}
                        onObjectTypeSelect={this.handleObjectTypeSelect} objectType={this.state.objectType}
                        newProperty={this.props.subjectId === null}/>
                <div className="statementView-qualifiers">
                    <div className="listView"/>
                    <div className="toolbar-container">
                        <span className="toolbar-button toolbar-container">
                            <a href="javascript:void(0)" title="">
                                <span className="fa fa-plus"/>
                                add qualifier
                            </a>
                        </span>
                    </div>
                </div>
            </div>
            <div className="statementView-references-container"/>
            <div className="editToolbar-container toolbar-container">
                <EditToolbar editorState={this.state.editorState} showRemoveButton={false}
                        onPublishClick={this.onPublishClick}
                        onCancelClick={this.props.onCancelClick}/>
            </div>
        </div>
    }

}