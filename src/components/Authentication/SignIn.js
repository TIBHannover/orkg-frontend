import { useMatomo } from '@jonkoops/matomo-tracker-react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { env } from 'next-runtime-env';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Cookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import { Alert, Form, FormGroup, Input, Label } from 'reactstrap';
import { getUserInformation, signInWithEmailAndPassword } from 'services/backend/users';
import { toggleAuthDialog, updateAuth } from 'slices/authSlice';
import { checkCookie } from 'utils';

const cookies = new Cookies();

const SignIn = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const dispatch = useDispatch();
    const router = useRouter();
    const { trackEvent } = useMatomo();
    const signIn = async (e) => {
        e.preventDefault();
        setLoading(true);

        let userToken;
        let tokenExpiresIn;
        signInWithEmailAndPassword(email, password)
            .then((token) => {
                userToken = token.access_token;
                cookies.set('token', token.access_token, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: token.expires_in });
                tokenExpiresIn = new Date(Date.now() + token.expires_in * 1000).toUTCString();
                cookies.set('token_expires_in', tokenExpiresIn, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: token.expires_in });
                // window.location.reload();
                return getUserInformation();
            })
            .then((userData) => {
                const { redirectRoute } = props;
                dispatch(
                    updateAuth({
                        user: {
                            displayName: userData.display_name,
                            id: userData.id,
                            token: userToken,
                            email: userData.email,
                            tokenExpire: tokenExpiresIn,
                            isCurationAllowed: userData.is_curation_allowed,
                            organization_id: userData.organization_id,
                            observatory_id: userData.observatory_id,
                        },
                        redirectRoute: null,
                    }),
                );
                document.body.style.overflow = 'auto scroll';
                dispatch(toggleAuthDialog());
                setLoading(false);
                trackEvent({ category: 'authentication', action: 'sign-in' });
                if (redirectRoute) {
                    router.push(redirectRoute);
                }
            })
            .catch((_e) => {
                let error = 'Something went wrong, please try again';
                cookies.remove('token', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                cookies.remove('token_expires_in', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                if (_e.error === 'invalid_grant') {
                    error = 'Wrong email address or password';
                } else if (_e.error_description) {
                    error = _e.error_description;
                } else if (!checkCookie()) {
                    error = 'Cookies must be enabled to sign in';
                }
                setLoading(false);
                setErrors(error);
            });
    };
    return (
        <Form className="ps-3 pe-3 pt-2" onSubmit={signIn}>
            {errors && <Alert color="danger">{errors}</Alert>}

            {props.signInRequired && <Alert color="info">You need to be signed in to use this functionality</Alert>}

            <FormGroup>
                <Label for="Email">Email address</Label>
                <Input onChange={(e) => setEmail(e.target.value)} value={email} type="email" name="email" id="Email" placeholder="Email address" />
            </FormGroup>
            <FormGroup>
                <Label for="Password">Password</Label>
                <Input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    name="password"
                    id="Password"
                    placeholder="Password"
                />
            </FormGroup>
            <ButtonWithLoading type="submit" onClick={signIn} color="primary" className="mt-4 mb-2" block isLoading={loading}>
                Sign in
            </ButtonWithLoading>
        </Form>
    );
};

SignIn.propTypes = {
    signInRequired: PropTypes.bool,
    redirectRoute: PropTypes.string,
};

export default SignIn;
