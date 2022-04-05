import { useState } from 'react';
import { Button, Form, FormGroup, Input, Label, Alert, FormFeedback } from 'reactstrap';
import { toggleAuthDialog, updateAuth } from 'slices/authSlice';
import { Link } from 'react-router-dom';
import { registerWithEmailAndPassword, signInWithEmailAndPassword, getUserInformation } from 'services/backend/users';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { get_error_message, checkCookie } from 'utils';
import ROUTES_CMS from 'constants/routesCms';
import ROUTES from 'constants/routes';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';
import InfoSheet from 'assets/pdf/infosheet-data-protection.pdf';
import { reverse } from 'named-urls';

const cookies = new Cookies();

export default function SignUp() {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [matchingPassword, setMatchingPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [termsConditionIsChecked, setTermsConditionIsChecked] = useState(false);
    const [dataProtectionIsChecked, setDataProtectionIsChecked] = useState(false);

    const signUp = async e => {
        e.preventDefault();
        setIsLoading(true);
        let userToken;
        let token_expires_in;
        if (termsConditionIsChecked && dataProtectionIsChecked) {
            registerWithEmailAndPassword(email, password, matchingPassword, name)
                .then(() => {
                    signInWithEmailAndPassword(email, password)
                        .then(token => {
                            userToken = token.access_token;
                            cookies.set('token', token.access_token, { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                            token_expires_in = new Date(Date.now() + token.expires_in * 1000).toUTCString();
                            cookies.set('token_expires_in', token_expires_in, { path: env('PUBLIC_URL'), maxAge: token.expires_in });
                            return getUserInformation();
                            //window.location.reload();
                        })
                        .then(userData => {
                            dispatch(
                                updateAuth({
                                    user: {
                                        displayName: userData.display_name,
                                        id: userData.id,
                                        token: userToken,
                                        email: userData.email,
                                        tokenExpire: token_expires_in,
                                        isCurationAllowed: userData.is_curation_allowed
                                    }
                                })
                            );
                            dispatch(toggleAuthDialog());
                            setIsLoading(false);
                            setErrors(null);
                        })
                        .catch(e => {
                            if (checkCookie()) {
                                cookies.remove('token', { path: env('PUBLIC_URL') });
                                cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
                                setIsLoading(false);
                                setErrors({ message: 'Something went wrong, please try again' });
                            } else {
                                setIsLoading(false);
                                setErrors({ message: 'Cookies must be enabled to sign in' });
                            }
                        });
                })
                .catch(e => {
                    setIsLoading(false);
                    if (password !== matchingPassword) {
                        setErrors({ message: 'Your password and confirmation password do not match.' });
                    } else if (e.message === '') {
                        setErrors({ message: 'Something went wrong, please try again' });
                    } else {
                        setErrors(e);
                    }
                });
        } else {
            setIsLoading(false);
            setErrors({ message: 'The Special Conditions and the data processing by TIB have to be accepted.' });
        }
    };

    return (
        <>
            <Form className="ps-3 pe-3 pt-2" onSubmit={signUp}>
                {Boolean(get_error_message(errors)) && <Alert color="danger">{get_error_message(errors)}</Alert>}
                <FormGroup>
                    <Label for="name">Display name</Label>
                    <Input
                        onChange={e => setName(e.target.value)}
                        value={name}
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Name"
                        invalid={Boolean(get_error_message(errors, 'display_name'))}
                    />
                    {Boolean(get_error_message(errors, 'display_name')) && <FormFeedback>{get_error_message(errors, 'display_name')}</FormFeedback>}
                </FormGroup>
                <FormGroup>
                    <Label for="Email">Email address</Label>
                    <Input
                        onChange={e => setEmail(e.target.value)}
                        value={email}
                        type="text"
                        name="email"
                        id="Email"
                        placeholder="Email address"
                        invalid={Boolean(get_error_message(errors, 'email'))}
                    />
                    {Boolean(get_error_message(errors, 'email')) && <FormFeedback>{get_error_message(errors, 'email')}</FormFeedback>}
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
                        invalid={Boolean(get_error_message(errors, 'password'))}
                    />
                    {Boolean(get_error_message(errors, 'password')) && <FormFeedback>{get_error_message(errors, 'password')}</FormFeedback>}
                </FormGroup>
                <FormGroup>
                    <Label for="matching_password">Confirm Password</Label>
                    <Input
                        onChange={e => setMatchingPassword(e.target.value)}
                        value={matchingPassword}
                        type="password"
                        name="matching_password"
                        id="matching_password"
                        placeholder="Confirm password"
                        invalid={Boolean(get_error_message(errors, 'matching_password'))}
                    />
                    {Boolean(get_error_message(errors, 'matching_password')) && (
                        <FormFeedback>{get_error_message(errors, 'matching_password')}</FormFeedback>
                    )}
                </FormGroup>
                <FormGroup check className="mb-0" style={{ fontSize: '90%' }}>
                    <Input
                        type="checkbox"
                        id="termsConditionIsChecked"
                        onChange={e => setTermsConditionIsChecked(e.target.checked)}
                        checked={termsConditionIsChecked}
                    />{' '}
                    <Label check for="termsConditionIsChecked" className="mb-0">
                        I accept the{' '}
                        <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.TERMS_OF_USE })} target="_blank">
                            Special Conditions ORKG
                        </Link>
                    </Label>
                </FormGroup>
                <FormGroup check style={{ fontSize: '90%' }}>
                    <Input
                        type="checkbox"
                        id="dataProtectionIsChecked"
                        onChange={e => setDataProtectionIsChecked(e.target.checked)}
                        checked={dataProtectionIsChecked}
                    />{' '}
                    <Label check for="dataProtectionIsChecked" className="mb-0">
                        I agree to the processing of my personal data provided here by Technische Informationsbibliothek (TIB). In accordance with the{' '}
                        <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.DATA_PROTECTION })} target="_blank">
                            data protection declaration
                        </Link>{' '}
                        as well as the{' '}
                        <a href={InfoSheet} target="_blank" rel="noopener noreferrer">
                            info sheet data protection
                        </a>
                        , the data is processed exclusively by TIB in order to provide services of our platform.
                    </Label>
                </FormGroup>
                <Button
                    type="submit"
                    color="primary"
                    className="mt-4 mb-2"
                    block
                    disabled={isLoading || !dataProtectionIsChecked || !termsConditionIsChecked}
                >
                    {!isLoading ? (
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
