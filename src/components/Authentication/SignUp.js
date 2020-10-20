import React, { Component } from 'react';
import { Button, Form, FormGroup, Input, Label, Alert, FormFeedback } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleAuthDialog, updateAuth } from 'actions/auth';
import { Link } from 'react-router-dom';
import { registerWithEmailAndPassword, signInWithEmailAndPassword, getUserInformation } from 'services/backend/users';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { get_error_message } from 'utils';
import ROUTES from 'constants/routes';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';

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
            errors: null,
            termsConditionIsChecked: false,
            dataProtectionIsChecked: false
        };
    }

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleCheckBoxChange = e => {
        this.setState({
            [e.target.name]: e.target.checked
        });
    };

    signUp = async e => {
        e.preventDefault();
        const { email, password, matching_password, name, termsConditionIsChecked, dataProtectionIsChecked } = this.state;

        this.setState({
            loading: true,
            errors: null
        });

        let userToken;
        let token_expires_in;
        if (termsConditionIsChecked && dataProtectionIsChecked) {
            registerWithEmailAndPassword(email, password, matching_password, name)
                .then(() => {
                    signInWithEmailAndPassword(email, password)
                        .then(token => {
                            userToken = token.access_token;
                            cookies.set('token', token.access_token, { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                            token_expires_in = new Date(Date.now() + token.expires_in * 1000);
                            cookies.set('token_expires_in', token_expires_in.toUTCString(), { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                            return getUserInformation();
                            //window.location.reload();
                        })
                        .then(userData => {
                            this.props.updateAuth({
                                user: {
                                    displayName: userData.display_name,
                                    id: userData.id,
                                    token: userToken,
                                    email: userData.email,
                                    tokenExpire: token_expires_in
                                }
                            });
                            this.props.toggleAuthDialog();
                            this.setState({ loading: false, errors: null });
                        })
                        .catch(e => {
                            cookies.remove('token');
                            cookies.remove('token_expires_in');
                            this.setState({ loading: false, errors: { message: 'Something went wrong, please try again' } });
                        });
                })
                .catch(e => {
                    this.setState({
                        loading: false,
                        errors: e
                    });
                });
        } else {
            this.setState({ loading: false, errors: { message: 'The Special Conditions and the data processing by TIB have to be accepted.' } });
        }
    };

    render() {
        return (
            <>
                <Form className="pl-3 pr-3 pt-2" onSubmit={this.signUp}>
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
                    <FormGroup check>
                        <Label check>
                            <Input
                                type="checkbox"
                                name="termsConditionIsChecked"
                                onChange={this.handleCheckBoxChange}
                                checked={this.state.termsConditionIsChecked}
                            />{' '}
                            <span className="text-danger">*</span> I accept the <Link to={ROUTES.TERMS_OF_USE}>Special Conditions ORKG</Link>.
                        </Label>
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input
                                type="checkbox"
                                name="dataProtectionIsChecked"
                                onChange={this.handleCheckBoxChange}
                                checked={this.state.dataProtectionIsChecked}
                            />{' '}
                            <span className="text-danger">*</span> I agree to the processing of my personal data provided here by Technische
                            Informationsbibliothek (TIB). In accordance with the
                            <Link to={ROUTES.DATA_PROTECTION}> data protection declaration</Link> as well as the{' '}
                            <a href="https://tib.eu/infoblatt-datenschutz" target="_blank" rel="noopener noreferrer">
                                info sheet data protection <Icon size="sm" icon={faExternalLinkAlt} />
                            </a>
                            , the data is processed exclusively by TIB in order to provide services of our platform.
                        </Label>
                    </FormGroup>
                    <Button
                        type="submit"
                        color="primary"
                        className="mt-4 mb-2"
                        block
                        disabled={this.state.loading || !this.state.dataProtectionIsChecked || !this.state.termsConditionIsChecked}
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
