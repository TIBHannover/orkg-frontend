import React, { Component } from 'react';
import { createLiteralStatement, createOrganization, createLiteral } from '../network';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { getAllClasses } from 'network';
import { updateUserRole, getUserInformation } from '../network';
import { openAuthDialog, updateAuth, resetAuth } from '../actions/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Cookies } from 'react-cookie';
import { reverse } from 'named-urls';
import ROUTES from '../constants/routes';

class AddOrganization extends Component {
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
        this.userInformation();
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

    userInformation = () => {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        //alert(token);
        if (token && !this.props.user) {
            getUserInformation()
                .then(userData => {
                    //alert(userData);
                    //debugger;
                    this.props.updateAuth({ user: { displayName: userData.display_name, id: userData.id, token: token, email: userData.email } });
                    //alert(this.props.user);
                })
                .catch(error => {
                    cookies.remove('token');
                });
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
        const image = this.state.previewSrc;
        //console.log('123' + image[0]);
        if (value && value.length !== 0) {
            try {
                const responseJson = await createOrganization(value, image[0]);
                const resourceId = responseJson.id;
                await updateUserRole();

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
        //const email = this.props.user && this.props.user.email ? this.props.user.email : 'example@example.com';
        //console.log(this.props.user);
        //console.log(this.state.email);
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                resourceId: ''
            });

            return <Redirect to={reverse(ROUTES.ORGANIZATION, { id: this.state.resourceId })} />;
        }

        return (
            <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5">
                <Form className="pl-3 pr-3 pt-2">
                    {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}
                    <FormGroup>
                        <Label for="ResourceLabel">Add Organization</Label>
                        <Input
                            onChange={this.handleChange}
                            onKeyUp={this.handleKeyUp}
                            type="text"
                            name="value"
                            id="ResourceLabel"
                            disabled={loading}
                            placeholder="Add Organiztion"
                        />
                    </FormGroup>
                    <div>
                        <img src={this.state.previewSrc} style={{ width: '20%', height: '20%' }} className="Avatar" alt="" />
                    </div>
                    <FormGroup>
                        <Label>Logo</Label>
                        <br />
                        <input type="file" onChange={this.handlePreview} />
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
                        {!loading ? 'Create Organization' : <span>Loading</span>}
                    </Button>
                </Form>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    dialogIsOpen: state.auth.dialogIsOpen,
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    resetAuth: () => dispatch(resetAuth()),
    openAuthDialog: action => dispatch(openAuthDialog(action)),
    updateAuth: data => dispatch(updateAuth(data))
});

AddOrganization.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    updateAuth: PropTypes.func.isRequired,
    user: PropTypes.object,
    resetAuth: PropTypes.func.isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddOrganization);
