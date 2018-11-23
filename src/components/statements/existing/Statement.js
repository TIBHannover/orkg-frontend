import React, {Component} from 'react';
import EditToolbar from '../EditToolbar';
import MainSnak from '../MainSnak';
import {updateLiteral, updateResource} from '../../../network';
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
        this.setText(responseJson.label);
        this.setEditorState('view');
        NotificationManager.success('Resource submitted successfully', 'Success', 5000);
    };

    onUpdateError = (error) => {
        this.revertText();
        this.setEditorState('view');
        console.error(error);
        NotificationManager.error(error.message, 'Error submitting resource', 5000);
    };

    handlePublishClick = async () => {
        const value = this.props.getText();
        if (value && value.length !== 0) {
            switch (this.state.objectType) {
                case 'literal': {
                    try {
                        const responseJson = await updateLiteral(this.id, value);
                        this.onUpdateLiteralSuccess(responseJson);
                    } catch (e) {
                        this.onUpdateError(e);
                    }
                    break;
                }
                case 'resource': {
                    try {
                        const responseJson = await updateResource(this.id, value);
                        this.onUpdateResourceSuccess(responseJson);
                    } catch (e) {
                        this.onUpdateError(e);
                    }
                    break;
                }
                default: {
                    throw new Error(`Unknown object type: ${this.state.objectType}`);
                }
            }
            this.setEditorState('loading');
        }
    };

    onValueChange(event) {
        this.setText(event.target.value.trim());
        this.forceUpdate();
    }

    handleCancelClick = () => {
        this.setEditorState('view');
        this.revertText();
    };

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

    handleKeyUp = async (event) => {
        switch (event.keyCode) {
            case 13: {
                await this.handlePublishClick();
                return false;
            }
            case 27: {
                this.handleCancelClick();
                return false;
            }
            default: {
                break;
            }
        }
    };

    handleTextAreaKeyUp = async (event) => {
        if (event.ctrlKey && event.keyCode === 13) {
            await this.handlePublishClick();
            return false;
        }
        switch (event.keyCode) {
            case 27: {
                this.handleCancelClick();
                return false;
            }
            default: {
                break;
            }
        }
    };

    render() {
        return <div className="statementView">
            <div className="statementView-rankSelector"/>
            <div className="statementView-mainSnak-container">
                <MainSnak ref="mainSnak" editing={this.state.editorState === 'edit'} id={this.id} text={this.getText()}
                        onInput={this.onValueChange} newProperty={false}
                        onObjectTypeSelect={this.handleObjectTypeSelect}
                        onObjectSelect={this.handleObjectSelect}
                        objectType={this.state.objectType}
                        onKeyUp={this.handleKeyUp}
                        onTextAreaKeyUp={this.handleTextAreaKeyUp}/>
            </div>
            <span className="editToolbar-container toolbar-container" aria-disabled={false}>
                <EditToolbar editorState={this.state.editorState} showRemoveButton={false} editEnabled={true}
                        onEditClick={this.onEditClick}
                        onPublishClick={this.handlePublishClick}
                        onCancelClick={this.handleCancelClick}/>
            </span>
        </div>
    }

};
