import React, {Component} from 'react';
import {updateResource, submitGetRequest, crossrefUrl} from '../helpers.js';
import {NotificationManager} from "react-notifications";
import './AddResource.css';

export default class AddResource extends Component {
    state = {
        value: '',
    }

    handleAdd = (event) => {
        const doiRegex = /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>])\S)+)\b/g;
        if (!doiRegex.test(this.state.value)) {
            this.createResource(event);
        } else {
            this.createResourceUsingDoi(event);
        }
    };

    createResourceUsingDoi = (event) => {
        submitGetRequest(crossrefUrl + this.state.value,
                (responseJson) => {
                    this.setState({value: responseJson.message.title[0]});
                    this.createResource(event);
                },
                (error) => {
                    console.error(error);
                    NotificationManager.error(error.message, 'Error finding DOI', 5000);
                });
    };

    handleInput = (event) => {
        this.setState({value: event.target.value});
    };

    handleKeyUp = (event) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            this.createResource(event);
        }
    };

    createResource = (event) => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            updateResource(this.id, value,
                (responseJson) => {
                    document.location.href = '/resource/' + responseJson.id;
                },
                (error) => {
                    console.error(error);
                    NotificationManager.error(error.message, 'Error creating resource', 5000);
                });
            this.setEditorState('loading');
        }
    };

    render() {
        return <div>
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Resource title or DOI" onInput={this.handleInput}
                        onKeyUp={this.handleKeyUp}
                        aria-label="Resource title or DOI" aria-describedby="basic-addon2"/>
                <div class="input-group-append">
                    <button class="btn btn-outline-primary" type="button" onClick={this.handleAdd}>Add</button>
                </div>
            </div>
        </div>
    }

}