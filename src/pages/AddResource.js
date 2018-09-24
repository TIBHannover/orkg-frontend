import React, {Component} from 'react';
import {updateResource} from '../helpers.js';
import {NotificationManager} from "react-notifications";
import './AddResource.css';

export default class AddResource extends Component {
    state = {
        value: '',
    }

    onPublishClick(event) {

    }

    handleInput = (event) => {
        this.setState({value: event.target.value});
    };

    createResource = (event) => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            updateResource(this.id, value, (responseJson) => {
                    document.location.href = '/resource/' + responseJson.id;
                    this.setText(responseJson.label);
                    this.setEditorState('view');
                    NotificationManager.success('Resource submitted successfully', 'Success', 5000);
                },
                (error) => {
                    console.error(error);
                    NotificationManager.error(error.message, 'Error submitting resource', 5000);
                });
            this.setEditorState('loading');
        }
    };

    render() {
        return <div>
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Resource name or DOI" onInput={this.handleInput}
                        aria-label="Resource name or DOI" aria-describedby="basic-addon2"/>
                <div class="input-group-append">
                    <button class="btn btn-outline-primary" type="button" onClick={this.createResource}>Add</button>
                </div>
            </div>
        </div>
    }

}