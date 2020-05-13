import React, { Component } from 'react';
import { createObservatory } from '../network';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ROUTES from '../constants/routes';

export default class AddObservatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            value: '',
            ObservatoryId: ''
        };
    }

    componentDidMount = () => {};

    setEditorState = editorState => {
        this.setState({ editorState: editorState });
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        await this.createNewObservatory(false);
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value.trim() });
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

    createNewObservatory = async () => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            try {
                const responseJson = await createObservatory(value, this.props.match.params.id);
                const observatoryId = responseJson.id;
                this.navigateToObservatory(observatoryId);
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                toast.error(`Error creating resource ${error.message}`);
            }
        }
    };

    navigateToObservatory = observatoryId => {
        this.setEditorState('edit');
        this.setState({ observatoryId: observatoryId }, () => {
            this.setState({ redirect: true });
        });
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                observatoryId: ''
            });

            return <Redirect to={reverse(ROUTES.OBSERVATORY, { id: this.state.observatoryId })} />;
        }

        return (
            <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5">
                <Form className="pl-3 pr-3 pt-2">
                    {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}
                    <FormGroup>
                        <Label for="ResourceLabel">Add Observatory</Label>
                        <Input
                            onChange={this.handleChange}
                            onKeyUp={this.handleKeyUp}
                            type="text"
                            name="value"
                            id="ResourceLabel"
                            disabled={loading}
                            placeholder="Add Observatory"
                        />
                    </FormGroup>
                    <Button
                        color="primary"
                        onClick={() => {
                            this.handleAdd();
                        }}
                        outline
                        className="mt-4 mb-2"
                        block
                        disabled={loading}
                    >
                        {!loading ? 'Create Observatory' : <span>Loading</span>}
                    </Button>
                </Form>
            </Container>
        );
    }
}

AddObservatory.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};
