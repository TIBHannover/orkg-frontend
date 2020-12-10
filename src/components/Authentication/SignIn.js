import { Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openAuthDialog, toggleAuthDialog, updateAuth } from 'actions/auth';
import { signInWithEmailAndPassword, getUserInformation } from 'services/backend/users';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

const cookies = new Cookies();

class SignIn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            loading: false,
            errors: null
        };
    }

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    signIn = async e => {
        e.preventDefault();
        this.setState({
            loading: true
        });
        let userToken;
        let token_expires_in;
        signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(token => {
                userToken = token.access_token;
                cookies.set('token', token.access_token, { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                token_expires_in = new Date(Date.now() + token.expires_in * 1000);
                cookies.set('token_expires_in', token_expires_in.toUTCString(), { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                //window.location.reload();
                return getUserInformation();
            })
            .then(userData => {
                const { redirectRoute } = this.props;
                this.props.updateAuth({
                    user: {
                        displayName: userData.display_name,
                        id: userData.id,
                        token: userToken,
                        email: userData.email,
                        tokenExpire: token_expires_in,
                        isCurationAllowed: userData.is_curation_allowed
                    },
                    redirectRoute: null
                });
                this.props.toggleAuthDialog();
                this.setState({ loading: false });
                if (redirectRoute) {
                    this.props.history.push(redirectRoute);
                }
            })
            .catch(e => {
                let error = 'Something went wrong, please try again';
                cookies.remove('token');
                cookies.remove('token_expires_in');
                if (e.error === 'invalid_grant') {
                    error = 'Wrong email address or password';
                } else if (e.error_description) {
                    error = e.error_description;
                }

                this.setState({ loading: false, errors: error });
            });
    };

    render() {
        return (
            <>
                <Form className="pl-3 pr-3 pt-2" onSubmit={this.signIn}>
                    {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}

                    {this.props.signInRequired && <Alert color="info">You need to be signed in to use this functionality</Alert>}

                    <FormGroup>
                        <Label for="Email">Email address</Label>
                        <Input
                            onChange={this.handleInputChange}
                            value={this.state.email}
                            type="email"
                            name="email"
                            id="Email"
                            placeholder="Email address"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="Password">
                            Password{' '}
                            {/*
                            <span
                                className="ml-1"
                                style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
                                onClick={() => {
                                    this.props.openAuthDialog('forgotpassword');
                                }}
                            >
                                Forgot?
                            </span>
                            */}
                        </Label>
                        <Input
                            onChange={this.handleInputChange}
                            value={this.state.password}
                            type="password"
                            name="password"
                            id="Password"
                            placeholder="Password"
                        />
                    </FormGroup>
                    <Button type="submit" color="primary" className="mt-4 mb-2" block disabled={this.state.loading}>
                        {!this.state.loading ? (
                            'Sign in'
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

SignIn.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    updateAuth: PropTypes.func.isRequired,
    toggleAuthDialog: PropTypes.func.isRequired,
    signInRequired: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    redirectRoute: PropTypes.string
};

SignIn.defaultProps = {
    redirectRoute: null
};

const mapStateToProps = state => ({
    signInRequired: state.auth.signInRequired,
    redirectRoute: state.auth.redirectRoute
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload)),
    updateAuth: data => dispatch(updateAuth(data)),
    toggleAuthDialog: () => dispatch(toggleAuthDialog())
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withRouter
)(SignIn);
