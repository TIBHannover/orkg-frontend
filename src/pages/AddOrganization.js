import React, { Component } from 'react';
import { createOrganization } from '../network';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
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

        this.state = {
            redirect: false,
            value: '',
            organizationId: '',
            previewSrc: ''
        };
    }

    componentDidMount = () => {
        this.userInformation();
    };

    setEditorState = editorState => {
        this.setState({ editorState: editorState });
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        await this.createNewOrganization(false);
    };

    userInformation = () => {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;

        if (token && !this.props.user) {
            getUserInformation()
                .then(userData => {
                    this.props.updateAuth({ user: { displayName: userData.display_name, id: userData.id, token: token, email: userData.email } });
                })
                .catch(error => {
                    cookies.remove('token');
                });
        }
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

    createNewOrganization = async () => {
        const value = this.state.value;
        const image = this.state.previewSrc;
        if (value && value.length !== 0) {
            try {
                const responseJson = await createOrganization(value, image[0]);
                const organizationId = responseJson.id;
                await updateUserRole();
                this.navigateToOrganization(organizationId);
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                toast.error(`Error creating resource ${error.message}`);
            }
        }
    };

    navigateToOrganization = organizationId => {
        this.setEditorState('edit');
        this.setState({ organizationId: organizationId }, () => {
            this.setState({ redirect: true });
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
                organizationId: ''
            });

            return <Redirect to={reverse(ROUTES.ORGANIZATION, { id: this.state.organizationId })} />;
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
    updateAuth: PropTypes.func.isRequired,
    user: PropTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddOrganization);
