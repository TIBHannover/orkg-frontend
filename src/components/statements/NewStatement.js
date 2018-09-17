import React, {Component} from 'react';
import EditToolbar from "./EditToolbar";
import {createResource} from "../../helpers";
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
    }

    onPublishClick(event) {
        // if (this.value && this.value.length !== 0) {
        //     createResource(this.value, (responseJson) => {
        //             this.setEditorState('view');
        //             NotificationManager.success('Resource submitted successfully', 'Success', 5000);
        //         },
        //         (error) => {
        //             this.setEditorState('view');
        //             console.error(error);
        //             NotificationManager.error(error.message, 'Error submitting resource', 5000);
        //         });
        // }
        // this.setEditorState('loading');
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