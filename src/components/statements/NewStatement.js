import React, {Component} from 'react';
import EditToolbar from "./EditToolbar";
import {createResource, createResourceStatement} from "../../helpers";
import {NotificationManager} from "react-notifications";
import MainSnak from "./MainSnak";

export default class NewStatement extends Component {

    state = {
        /* Possible values: 'edit', 'loading'. */
        editorState: 'edit',
    };

    value = null;

    constructor(props) {
        super(props);

        this.value = this.props.text;
        this.onResourceCreationSuccess = this.onResourceCreationSuccess.bind(this);
        this.onResourceCreationError = this.onResourceCreationError.bind(this);
    }

    onResourceCreationSuccess(responseJson) {
        this.setEditorState('edit');
        NotificationManager.success('Resource added successfully', 'Success', 5000);
        this.props.onPublishSuccess();
    }

    onResourceCreationError(error) {
        this.setEditorState('edit');
        console.error(error);
        NotificationManager.error(error.message, 'Error creating resource statement (predicate)', 5000);
    }

    onPublishClick(event) {
        if (this.value && this.value.length !== 0) {
            createResource(this.value, (responseJson) => {
                    createResourceStatement(this.props.subjectId, this.props.predicateId, responseJson.id,
                            this.onResourceCreationSuccess, this.onResourceCreationError);
                },
                (error) => {
                    this.setEditorState('edit');
                    console.error(error);
                    NotificationManager.error(error.message, 'Error creating resource', 5000);
                });
            this.setEditorState('loading');
        }
    }

    setEditorState(editorState) {
        this.setState({editorState: editorState});
    }

    onValueChange(event) {
        this.value = event.target.value.trim();
    }

    render() {
        return <div id="new" className="statementView newStatement">
            <div className="statementView-rankSelector">
                <div className="rankSelector">
                    <span className="fa fa-sort"/>
                </div>
            </div>
            <div className="statementView-mainSnak-container">
                <MainSnak editing={true} text="" onInput={this.onValueChange.bind(this)}/>
                <div className="statementView-qualifiers">
                    <div className="listView"/>
                    <div className="toolbar-container">
                        <span className="toolbar-button toolbar-container">
                            <a href="#" title="">
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
                        onPublishClick={this.onPublishClick.bind(this)}
                        onCancelClick={this.props.onCancelClick}/>
            </div>
        </div>
    }

}