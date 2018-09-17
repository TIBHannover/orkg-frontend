import React, {Component} from 'react';
import EditToolbar from "./EditToolbar";
import MainSnak from "./MainSnak";
import {updateResource} from "../../helpers";
import {NotificationManager} from "react-notifications";

export default class Statement extends Component {

    state = {
        /* Possible values: 'view', 'edit', 'loading'. */
        editorState: 'view',
    };

    id = null;
    value = null;

    constructor(props) {
        super(props);

        this.id = this.props.id;
        this.value = this.props.text;

        this.setEditorState = this.setEditorState.bind(this);
    }

    onEditClick(event) {
        this.setEditorState('edit');
    }

    onPublishClick(event) {
        if (this.value && this.value.length !== 0) {
            updateResource(this.id, this.value, (responseJson) => {
                    this.setEditorState('view');
                    NotificationManager.success('Resource submitted successfully', 'Success', 5000);
                },
                (error) => {
                    this.setEditorState('view');
                    console.error(error);
                    NotificationManager.error(error.message, 'Error submitting resource', 5000);
                });
            this.setEditorState('loading');
        }
    }

    onValueChange(event) {
        this.value = event.target.value.trim();
    }

    onCancelClick(event) {
        this.setEditorState('view');
    }

    setEditorState(editorState) {
        this.setState({editorState: editorState});
    }

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainSnak-container">
                <MainSnak editing={this.state.editorState === 'edit'} text={this.props.text}
                        onInput={this.onValueChange.bind(this)}/>
            </div>
            <span className="editToolbar-container toolbar-container" aria-disabled={false}>
                <EditToolbar editorState={this.state.editorState} showRemoveButton={true}
                        onEditClick={this.onEditClick.bind(this)}
                        onPublishClick={this.onPublishClick.bind(this)}
                        onCancelClick={this.onCancelClick.bind(this)}/>
            </span>
        </div>
    }

};