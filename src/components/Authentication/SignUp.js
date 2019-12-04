import { Button, Form, FormGroup, Input, Label, Alert, FormFeedback } from 'reactstrap';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleAuthDialog, updateAuth } from '../../actions/auth';
import { registerWithEmailAndPassword, signInWithEmailAndPassword } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { get_error_message } from 'utils';
import { Cookies } from 'react-cookie';
const cookies = new Cookies();

class SignUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            email: '',
            password: '',
            matching_password: '',
            loading: false,
            errors: null
        };
    }

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    signUp = async () => {
        const { email, password, matching_password, name } = this.state;

        this.setState({
            loading: true,
            errors: null
        });

        registerWithEmailAndPassword(email, password, matching_password, name)
            .then(() => {
                signInWithEmailAndPassword(email, password)
                    .then(token => {
                        cookies.set('token', token.access_token, { path: '/', maxAge: token.expires_in });
                        this.props.toggleAuthDialog();
                        this.setState({ loading: false, errors: null });
                        window.location.reload();
                    })
                    .catch(e => {
                        this.setState({ loading: false, errors: 'Something went wrong, please try again' });
                    });
            })
            .catch(e => {
                this.setState({
                    loading: false,
                    errors: e
                });
            });
    };

    render() {
        return (
            <>
                <Form className="pl-3 pr-3 pt-2">
                    {Boolean(get_error_message(this.state.errors)) && <Alert color="danger">{get_error_message(this.state.errors)}</Alert>}
                    <FormGroup>
                        <Label for="name">Display name</Label>
                        <Input
                            onChange={this.handleInputChange}
                            value={this.state.name}
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Name"
                            invalid={Boolean(get_error_message(this.state.errors, 'display_name'))}
                        />
                        {Boolean(get_error_message(this.state.errors, 'display_name')) && (
                            <FormFeedback>{get_error_message(this.state.errors, 'display_name')}</FormFeedback>
                        )}
                    </FormGroup>
                    <FormGroup>
                        <Label for="Email">Email address</Label>
                        <Input
                            onChange={this.handleInputChange}
                            value={this.state.email}
                            type="text"
                            name="email"
                            id="Email"
                            placeholder="Email address"
                            invalid={Boolean(get_error_message(this.state.errors, 'email'))}
                        />
                        {Boolean(get_error_message(this.state.errors, 'email')) && (
                            <FormFeedback>{get_error_message(this.state.errors, 'email')}</FormFeedback>
                        )}
                    </FormGroup>
                    <FormGroup>
                        <Label for="Password">Password</Label>
                        <Input
                            onChange={this.handleInputChange}
                            value={this.state.password}
                            type="password"
                            name="password"
                            id="Password"
                            placeholder="Password"
                            invalid={Boolean(get_error_message(this.state.errors, 'password'))}
                        />
                        {Boolean(get_error_message(this.state.errors, 'password')) && (
                            <FormFeedback>{get_error_message(this.state.errors, 'password')}</FormFeedback>
                        )}
                    </FormGroup>
                    <FormGroup>
                        <Label for="Password">Confirm Password</Label>
                        <Input
                            onChange={this.handleInputChange}
                            value={this.state.matching_password}
                            type="password"
                            name="matching_password"
                            id="matching_password"
                            placeholder="Confirm password"
                            invalid={Boolean(get_error_message(this.state.errors, 'matching_password'))}
                        />
                        {Boolean(get_error_message(this.state.errors, 'matching_password')) && (
                            <FormFeedback>{get_error_message(this.state.errors, 'matching_password')}</FormFeedback>
                        )}
                    </FormGroup>
                    <Button
                        color="primary"
                        onClick={() => {
                            this.signUp();
                        }}
                        className="mt-4 mb-2"
                        block
                        disabled={this.state.loading}
                    >
                        {!this.state.loading ? (
                            'Sign up'
                        ) : (
                            <span>
                                <Icon icon={faSpinner} spin /> Loading
                            </span>
                        )}
                    </Button>
                </Form>
            </>
        );
    }
}

SignUp.propTypes = {
    updateAuth: PropTypes.func.isRequired,
    toggleAuthDialog: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    updateAuth: data => dispatch(updateAuth(data)),
    toggleAuthDialog: () => dispatch(toggleAuthDialog())
});

export default connect(
    null,
    mapDispatchToProps
)(SignUp);
