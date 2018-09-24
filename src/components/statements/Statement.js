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
    oldText = null;

    constructor(props) {
        super(props);

        this.id = this.props.id;

        this.getText = this.props.getText;
        this.setText = this.props.setText;

        this.setEditorState = this.setEditorState.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.onPublishClick = this.onPublishClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
    }

    storeText() {
        this.oldText = this.props.getText();
    }

    revertText() {
        this.setText(this.oldText);
        this.oldText = null;
    }

    onEditClick(event) {
        this.setEditorState('edit');
        this.storeText();
    }

    onPublishClick(event) {
        const that = this;
        const value = this.props.getText();
        if (value && value.length !== 0) {
            updateResource(this.id, value, (responseJson) => {
                    this.setText(responseJson.label);
                    this.setEditorState('view');
                    NotificationManager.success('Resource submitted successfully', 'Success', 5000);
                    // this.forceUpdate();
                },
                (error) => {
                    this.revertText();
                    this.setEditorState('view');
                    console.error(error);
                    NotificationManager.error(error.message, 'Error submitting resource', 5000);
                });
            this.setEditorState('loading');
        }
    }

    onValueChange(event) {
        this.setText(event.target.value.trim());
        this.forceUpdate();
    }

    onCancelClick(event) {
        this.setEditorState('view');
        this.revertText();
    }

    setEditorState(editorState) {
        this.setState({editorState: editorState});
    }

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainSnak-container">
                <MainSnak ref="mainSnak" editing={this.state.editorState === 'edit'} text={this.getText()}
                        onInput={this.onValueChange} newProperty={false}/>
            </div>
            <span className="editToolbar-container toolbar-container" aria-disabled={false}>
                <EditToolbar editorState={this.state.editorState} showRemoveButton={true}
                        onEditClick={this.onEditClick}
                        onPublishClick={this.onPublishClick}
                        onCancelClick={this.onCancelClick}/>
            </span>
        </div>
    }

};