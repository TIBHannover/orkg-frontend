import React, {Component} from 'react';
import EditToolbar from '../EditToolbar';
import MainSnak from '../MainSnak';
import {createLiteralStatement, createResourceStatement} from '../../../helpers';
import {NotificationManager} from 'react-notifications';

export default class Statement extends Component {

    state = {
        /* Possible values: 'view', 'edit', 'loading'. */
        editorState: 'view',
        objectType: 'literal',
        selectedObjectId: null,
    };

    id = null;
    oldText = null;

    constructor(props) {
        super(props);

        this.id = this.props.id;

        this.getText = this.props.getText;
        this.setText = this.props.setText;

        this.state.objectType = this.props.type;

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

    onEditClick() {
        this.setEditorState('edit');
        this.storeText();
    }

    onUpdateResourceSuccess = (responseJson) => {
        this.setText(responseJson.label);
        this.setEditorState('view');
        NotificationManager.success('Resource submitted successfully', 'Success', 5000);
    };

    onUpdateLiteralSuccess = (responseJson) => {
        this.setText(responseJson.object.value);
        this.setEditorState('view');
        NotificationManager.success('Resource submitted successfully', 'Success', 5000);
    };

    onUpdateError = (error) => {
        this.revertText();
        this.setEditorState('view');
        console.error(error);
        NotificationManager.error(error.message, 'Error submitting resource', 5000);
    };

    onPublishClick() {
        const value = this.props.getText();
        if (value && value.length !== 0) {
            switch (this.state.objectType) {
                case 'literal': {
                    createLiteralStatement(this.props.subjectId, this.props.predicateId, value,
                            this.onUpdateLiteralSuccess, this.onUpdateError);
                    break;
                }
                case 'resource': {
                    createResourceStatement(this.props.subjectId, this.props.predicateId,
                            this.state.selectedObjectId || this.id,
                            this.onUpdateResourceSuccess, this.onUpdateError);
                    break;
                }
                default: {
                    throw 'Unknown object type: ' + this.state.objectType + ']';
                }
            }
            this.setEditorState('loading');
        }
    }

    onValueChange(event) {
        this.setText(event.target.value.trim());
        this.forceUpdate();
    }

    onCancelClick() {
        this.setEditorState('view');
        this.revertText();
    }

    setEditorState(editorState) {
        this.setState({editorState: editorState});
    }

    handleObjectTypeSelect = (itemName) => {
        this.setState({
            objectType: itemName
        });
    };

    handleObjectSelect = (objectId) => {
        this.setState({
            selectedObjectId: objectId
        });
    };

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainSnak-container">
                <MainSnak ref="mainSnak" editing={this.state.editorState === 'edit'} id={this.id} text={this.getText()}
                        onInput={this.onValueChange} newProperty={false}
                        onObjectTypeSelect={this.handleObjectTypeSelect}
                        onObjectSelect={this.handleObjectSelect}
                        objectType={this.state.objectType}/>
            </div>
            <span className="editToolbar-container toolbar-container" aria-disabled={false}>
                <EditToolbar editorState={this.state.editorState} showRemoveButton={true} editEnabled={true}
                        onEditClick={this.onEditClick}
                        onPublishClick={this.onPublishClick}
                        onCancelClick={this.onCancelClick}/>
            </span>
        </div>
    }

};