import React, {Component} from 'react';
import {
    createLiteralStatement,
    createPredicate,
    createResource,
    crossrefUrl,
    getPredicatesByLabel,
    submitGetRequest
} from '../network';
import {NotificationManager} from 'react-notifications';
import './AddResource.css';
import {doiPredicateLabel} from '../utils';

export default class AddResource extends Component {
    state = {
        value: '',
        /* Possible values: 'edit', 'loading'. */
        editorState: 'edit',
    };

    doi = null;

    setEditorState = (editorState) => {
        this.setState({editorState: editorState});
    };

    handleAdd = () => {
        this.setEditorState('loading');
        const doiRegex = /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/g;
        if (!doiRegex.test(this.state.value)) {
            this.createResource(false);
        } else {
            this.doi = this.state.value;
            this.createResourceUsingDoi();
        }
    };

    createResourceUsingDoi = () => {
        submitGetRequest(crossrefUrl + this.state.value,
                (responseJson) => {
                    this.setState({value: responseJson.message.title[0]});
                    this.createResource(true);
                },
                (error) => {
                    console.error(error);
                    NotificationManager.error(error.message, 'Error finding DOI', 5000);
                    this.setEditorState('edit');
                });
    };

    handleInput = (event) => {
        this.setState({value: event.target.value.trim()});
    };

    handleKeyUp = (event) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            this.handleAdd();
        }
    };

    handleLiteralStatementCreationError = (error) => {
        console.error(error);
        NotificationManager.error(error.message, 'Error creating literal statement', 5000);
    };

    createResource = (usingDoi) => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            createResource(value,
                (responseJson) => {
                    const resourceId = responseJson.id;
                    if (usingDoi) {
                        this.createDoiStatement(resourceId);
                    } else {
                        this.navigateToResource(resourceId);
                    }
                },
                (error) => {
                    console.error(error);
                    NotificationManager.error(error.message, 'Error creating resource', 5000);
                    this.setEditorState('edit');
                });
        }
    };

    navigateToResource = (resourceId) => {
        this.setEditorState('edit');
        document.location.href = '/resource/' + resourceId;
    };

    createLiteralStatement = (resourceId, predicateId) => {
        createLiteralStatement(resourceId, predicateId, this.doi,
                () => this.navigateToResource(resourceId), this.handleLiteralStatementCreationError);
    };

    createDoiStatement = (resourceId) => {
        getPredicatesByLabel(doiPredicateLabel,
            (responseJson1) => {
                const doiPredicate = responseJson1.find((item) => item.label === doiPredicateLabel);
                if (!doiPredicate) {
                    createPredicate(doiPredicateLabel, (responseJson2) => {
                                this.createLiteralStatement(resourceId, responseJson2.id);
                            },
                            (error) => {
                                this.setEditorState('edit');
                                console.error(error);
                                NotificationManager.error(error.message, 'Error creating predicate', 5000);
                            });
                } else {
                    this.createLiteralStatement(resourceId, doiPredicate.id);
                }
            },
            (error) => {
                console.error(error);
                NotificationManager.error(error.message, 'Error finding predicates', 5000);
                this.setEditorState('edit');
            });
    };

    render() {
        const loading = this.state.editorState === 'loading';
        return <div className="input-group mb-3">
            <input type="text" className="form-control" placeholder="Research contribution title or DOI"
                    disabled={loading}
                    onInput={this.handleInput}
                    onKeyUp={this.handleKeyUp}
                    aria-label="Resource title or DOI" aria-describedby="basic-addon2"/>
            {
                !loading ? <div className="input-group-append">
                        <button className="btn btn-outline-primary" type="button" onClick={this.handleAdd}>Add</button>
                    </div>
                    : <div className="container vertical-centered">
                        <span className="fa fa-spinner fa-spin"/>
                    </div>
            }
        </div>
    }

}
