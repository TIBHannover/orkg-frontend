import { Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { toggleAuthDialog, updateAuth } from 'slices/authSlice';
import { signInWithEmailAndPassword, getUserInformation } from 'services/backend/users';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { checkCookie } from 'utils';
import env from '@beam-australia/react-env';
import { useDispatch } from 'react-redux';
import { useMatomo } from '@datapunt/matomo-tracker-react';

const cookies = new Cookies();

const SignIn = props => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { trackEvent } = useMatomo();
    const signIn = async e => {
        e.preventDefault();
        setLoading(true);

        let userToken;
        let token_expires_in;
        signInWithEmailAndPassword(email, password)
            .then(token => {
                userToken = token.access_token;
                cookies.set('token', token.access_token, { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                token_expires_in = new Date(Date.now() + token.expires_in * 1000).toUTCString();
                cookies.set('token_expires_in', token_expires_in, { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                // window.location.reload();
                return getUserInformation();
            })
            .then(userData => {
                const { redirectRoute } = props;
                dispatch(
                    updateAuth({
                        user: {
                            displayName: userData.display_name,
                            id: userData.id,
                            token: userToken,
                            email: userData.email,
                            tokenExpire: token_expires_in,
                            isCurationAllowed: userData.is_curation_allowed,
                        },
                        redirectRoute: null,
                    }),
                );
                dispatch(toggleAuthDialog());
                setLoading(false);
                trackEvent({ category: 'authentication', action: 'sign-in' });
                if (redirectRoute) {
                    navigate(redirectRoute);
                }
            })
            .catch(e => {
                let error = 'Something went wrong, please try again';
                cookies.remove('token', { path: env('PUBLIC_URL') });
                cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
                if (e.error === 'invalid_grant') {
                    error = 'Wrong email address or password';
                } else if (e.error_description) {
                    error = e.error_description;
                } else if (!checkCookie()) {
                    error = 'Cookies must be enabled to sign in';
                }
                setLoading(false);
                setErrors(error);
            });
    };

    return (
        <>
            <Form className="ps-3 pe-3 pt-2" onSubmit={signIn}>
                {errors && <Alert color="danger">{errors}</Alert>}

                {props.signInRequired && <Alert color="info">You need to be signed in to use this functionality</Alert>}

                <FormGroup>
                    <Label for="Email">Email address</Label>
                    <Input onChange={e => setEmail(e.target.value)} value={email} type="email" name="email" id="Email" placeholder="Email address" />
                </FormGroup>
                <FormGroup>
                    <Label for="Password">Password</Label>
                    <Input
                        onChange={e => setPassword(e.target.value)}
                        value={password}
                        type="password"
                        name="password"
                        id="Password"
                        placeholder="Password"
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="mt-4 mb-2" block disabled={loading}>
                    {!loading ? (
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
};

SignIn.propTypes = {
    signInRequired: PropTypes.bool,
    redirectRoute: PropTypes.string,
};

export default SignIn;
