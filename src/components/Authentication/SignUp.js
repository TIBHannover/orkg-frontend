import { useMatomo } from '@jonkoops/matomo-tracker-react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import Link from 'next/link';
import { env } from 'next-runtime-env';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import ROUTES_CMS from 'constants/routesCms';
import { reverse } from 'named-urls';
import { useState } from 'react';
import { Cookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import { Alert, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { getUserInformation, registerWithEmailAndPassword, signInWithEmailAndPassword } from 'services/backend/users';
import { toggleAuthDialog, updateAuth } from 'slices/authSlice';
import { checkCookie, getErrorMessage } from 'utils';

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
    const { trackEvent } = useMatomo();

    const signUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        let userToken;
        let tokenExpiresIn;
        if (termsConditionIsChecked && dataProtectionIsChecked) {
            registerWithEmailAndPassword(email, password, matchingPassword, name)
                .then(() => {
                    signInWithEmailAndPassword(email, password)
                        .then((token) => {
                            userToken = token.access_token;
                            cookies.set('token', token.access_token, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: token.expires_in });
                            tokenExpiresIn = new Date(Date.now() + token.expires_in * 1000).toUTCString();
                            cookies.set('token_expires_in', tokenExpiresIn, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: token.expires_in });
                            return getUserInformation();
                            // window.location.reload();
                        })
                        .then((userData) => {
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
                                }),
                            );
                            document.body.style.overflow = 'auto scroll';
                            dispatch(toggleAuthDialog());
                            setIsLoading(false);
                            setErrors(null);
                            trackEvent({ category: 'authentication', action: 'sign-up' });
                        })
                        .catch(() => {
                            if (checkCookie()) {
                                cookies.remove('token', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                                cookies.remove('token_expires_in', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                                setIsLoading(false);
                                setErrors({ message: 'Something went wrong, please try again' });
                            } else {
                                setIsLoading(false);
                                setErrors({ message: 'Cookies must be enabled to sign in' });
                            }
                        });
                })
                .catch((_e) => {
                    setIsLoading(false);
                    if (password !== matchingPassword) {
                        setErrors({ message: 'Your password and confirmation password do not match.' });
                    } else if (_e.message === '') {
                        setErrors({ message: 'Something went wrong, please try again' });
                    } else {
                        setErrors(_e);
                    }
                });
        } else {
            setIsLoading(false);
            setErrors({ message: 'The Special Conditions and the data processing by TIB have to be accepted.' });
        }
    };

    return (
        <Form className="ps-3 pe-3 pt-2" onSubmit={signUp}>
            {Boolean(getErrorMessage(errors)) && <Alert color="danger">{getErrorMessage(errors)}</Alert>}
            <FormGroup>
                <Label for="name">Display name</Label>
                <Input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Name"
                    invalid={Boolean(getErrorMessage(errors, 'display_name'))}
                    maxLength={MAX_LENGTH_INPUT}
                />
                {Boolean(getErrorMessage(errors, 'display_name')) && <FormFeedback>{getErrorMessage(errors, 'display_name')}</FormFeedback>}
            </FormGroup>
            <FormGroup>
                <Label for="Email">Email address</Label>
                <Input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="text"
                    name="email"
                    id="Email"
                    placeholder="Email address"
                    invalid={Boolean(getErrorMessage(errors, 'email'))}
                    maxLength={MAX_LENGTH_INPUT}
                />
                {Boolean(getErrorMessage(errors, 'email')) && <FormFeedback>{getErrorMessage(errors, 'email')}</FormFeedback>}
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
                    invalid={Boolean(getErrorMessage(errors, 'password'))}
                />
                {Boolean(getErrorMessage(errors, 'password')) && <FormFeedback>{getErrorMessage(errors, 'password')}</FormFeedback>}
            </FormGroup>
            <FormGroup>
                <Label for="matching_password">Confirm Password</Label>
                <Input
                    onChange={(e) => setMatchingPassword(e.target.value)}
                    value={matchingPassword}
                    type="password"
                    name="matching_password"
                    id="matching_password"
                    placeholder="Confirm password"
                    invalid={Boolean(getErrorMessage(errors, 'matching_password'))}
                />
                {Boolean(getErrorMessage(errors, 'matching_password')) && <FormFeedback>{getErrorMessage(errors, 'matching_password')}</FormFeedback>}
            </FormGroup>
            <FormGroup check className="mb-0" style={{ fontSize: '90%' }}>
                <Input
                    type="checkbox"
                    id="termsConditionIsChecked"
                    onChange={(e) => setTermsConditionIsChecked(e.target.checked)}
                    checked={termsConditionIsChecked}
                />{' '}
                <Label check for="termsConditionIsChecked" className="mb-0">
                    I accept the{' '}
                    <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.TERMS_OF_USE })} target="_blank">
                        Special Conditions ORKG
                    </Link>
                </Label>
            </FormGroup>
            <FormGroup check style={{ fontSize: '90%' }}>
                <Input
                    type="checkbox"
                    id="dataProtectionIsChecked"
                    onChange={(e) => setDataProtectionIsChecked(e.target.checked)}
                    checked={dataProtectionIsChecked}
                />{' '}
                <Label check for="dataProtectionIsChecked" className="mb-0">
                    I agree to the processing of my personal data provided here by Technische Informationsbibliothek (TIB). In accordance with the{' '}
                    <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.DATA_PROTECTION })} target="_blank">
                        data protection declaration
                    </Link>{' '}
                    as well as the{' '}
                    <a href="/files/infosheet-data-protection.pdf" target="_blank" rel="noopener noreferrer">
                        info sheet data protection
                    </a>
                    , the data is processed exclusively by TIB in order to provide services of our platform.
                </Label>
            </FormGroup>
            <ButtonWithLoading
                type="submit"
                color="primary"
                className="mt-4 mb-2"
                block
                disabled={isLoading || !dataProtectionIsChecked || !termsConditionIsChecked}
                isLoading={isLoading}
            >
                Sign up
            </ButtonWithLoading>
        </Form>
    );
}
