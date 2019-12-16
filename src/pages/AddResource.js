import React, { Component } from 'react';
import { createLiteralStatement, createResource, crossrefUrl, submitGetRequest, createLiteral } from '../network';
import { Container } from 'reactstrap';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import ROUTES from '../constants/routes';

export default class AddResource extends Component {
    state = {
        value: '',
        /* Possible values: 'edit', 'loading'. */
        editorState: 'edit'
    };

    doi = null;

    setEditorState = editorState => {
        this.setState({ editorState: editorState });
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        const doiRegex = /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/g;
        if (!doiRegex.test(this.state.value)) {
            await this.createNewResource(false);
        } else {
            console.log('this is a DOI');
            this.doi = this.state.value;
            await this.createResourceUsingDoi();
        }
    };

    createResourceUsingDoi = async () => {
        try {
            const responseJson = await submitGetRequest(crossrefUrl + this.state.value);
            console.log(responseJson);
            this.setState({ value: responseJson.message.title[0] });
            await this.createNewResource(true);
        } catch (error) {
            console.error(error);
            toast.error(`Error finding DOI ${error.message}`);
            this.setEditorState('edit');
        }
    };

    handleInput = event => {
        this.setState({ value: event.target.value.trim() });
    };

    handleKeyUp = async event => {
        event.preventDefault();
        if (event.keyCode === 13) {
            await this.handleAdd();
        }
    };

    handleLiteralStatementCreationError = error => {
        console.error(error);
        toast.error(`Error creating literal statement ${error.message}`);
    };

    createNewResource = async usingDoi => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            try {
                const responseJson = await createResource(value);
                const resourceId = responseJson.id;

                if (usingDoi) {
                    await this.createDoiStatement(resourceId, process.env.REACT_APP_PREDICATES_HAS_DOI);
                } else {
                    this.navigateToResource(resourceId);
                }
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                toast.error(`Error creating resource ${error.message}`);
            }
        }
    };

    navigateToResource = resourceId => {
        this.setEditorState('edit');
        document.location.href = reverse(ROUTES.RESOURCE, { id: resourceId });
    };

    createDoiStatement = async (resourceId, predicateId) => {
        const responseJson = await createLiteral(this.doi);
        createLiteralStatement(resourceId, predicateId, responseJson.id).then(result => {
            this.navigateToResource(resourceId);
        });
    };

    render() {
        const loading = this.state.editorState === 'loading';

        return (
            <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Research contribution title or DOI"
                        disabled={loading}
                        onInput={this.handleInput}
                        onKeyUp={this.handleKeyUp}
                        aria-label="Resource title or DOI"
                        aria-describedby="basic-addon2"
                    />
                    {!loading ? (
                        <div className="input-group-append">
                            <button className="btn btn-outline-primary" type="button" onClick={this.handleAdd}>
                                Add
                            </button>
                        </div>
                    ) : (
                        <div className="container vertical-centered">
                            <span className="fa fa-spinner fa-spin" />
                        </div>
                    )}
                </div>
            </Container>
        );
    }
}
