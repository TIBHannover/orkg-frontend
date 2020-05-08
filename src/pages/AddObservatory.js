import React, { Component } from 'react';
import { createLiteralStatement, createObservatory, crossrefUrl, submitGetRequest, createLiteral } from '../network';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { getAllClasses } from 'network';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ROUTES from '../constants/routes';

export default class AddObservatory extends Component {
    constructor(props) {
        super(props);

        this.doi = null;
        this.state = {
            redirect: false,
            value: '',
            classes: [],
            /* Possible values: 'edit', 'loading'. */
            editorState: 'edit',
            resourceId: '',
            classesOptions: [],
            previewSrc: ''
        };
    }

    componentDidMount = () => {
        console.log('test');
        this.getClasses();
    };

    getClasses = () => {
        getAllClasses().then(classes => {
            this.setState({ classesOptions: classes });
        });
    };

    setEditorState = editorState => {
        this.setState({ editorState: editorState });
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        const doiRegex = /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/g;
        if (!doiRegex.test(this.state.value)) {
            await this.createNewResource(false);
        } //else {
        //console.log('this is a DOI');
        //this.doi = this.state.value;
        //await this.createResourceUsingDoi();
        //}
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

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value.trim() });
    };

    handleClassesChange = classesArray => {
        this.setState({ classes: classesArray });
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
        //const image = this.state.previewSrc;
        //console.log("123"+image[0]);
        if (value && value.length !== 0) {
            try {
                //alert(value+"-"+this.props.match.params.id);
                const responseJson = await createObservatory(value, this.props.match.params.id);
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
        this.setState({ resourceId: resourceId }, () => {
            this.setState({ redirect: true });
        });
    };

    createDoiStatement = async (resourceId, predicateId) => {
        const responseJson = await createLiteral(this.doi);
        createLiteralStatement(resourceId, predicateId, responseJson.id).then(result => {
            this.navigateToResource(resourceId);
        });
    };

    handlePreview = async e => {
        e.preventDefault();

        const file = e.target.files[0];
        const reader = new FileReader();

        if (e.target.files.length === 0) {
            return;
        }

        reader.onloadend = e => {
            this.setState({
                previewSrc: [reader.result]
            });
        };

        reader.readAsDataURL(file);
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                resourceId: ''
            });

            return <Redirect to={reverse(ROUTES.OBSERVATORY, { id: this.state.resourceId })} />;
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
