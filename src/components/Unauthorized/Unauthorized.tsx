import { faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Container } from 'reactstrap';
import { login, register } from 'services/keycloak';
import { RootStore } from 'slices/types';

/**
 * Unauthorized can mean both unauthenticated and unauthorized. So when a user is not signed in,
 * a sign in button is displayed, otherwise just a general unauthorized message is shown
 */
const Unauthorized = () => {
    const user = useSelector((state: RootStore) => state.auth.user);

    useEffect(() => {
        document.title = 'Unauthorized - ORKG';
    }, []);

    const handleSignIn = () => {
        login({ redirectUri: window.location.href });
    };

    const handleSignUp = () => {
        register();
    };

    return (
        <>
            <TitleBar>Authentication required</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12 text-center">
                            <FontAwesomeIcon icon={faLock} className="text-primary mt-3 mb-3" style={{ fontSize: 45 }} />
                            {user ? (
                                <div className="mb-4 lead">You need to be signed in to use this functionality</div>
                            ) : (
                                <>
                                    <h2 className="mb-4 h4">You need to sign in to continue</h2>
                                    <Button color="primary" className="me-3" onClick={handleSignIn}>
                                        Sign in
                                    </Button>
                                </>
                            )}
                            <Link href={ROUTES.HOME}>
                                <Button color="primary" outline className="me-3">
                                    Go to home
                                </Button>
                            </Link>
                            <div className="mt-4">
                                Not a member?{' '}
                                <span
                                    style={{
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                    }}
                                    onClick={handleSignUp}
                                    onKeyDown={(e) => (e.key === 'Enter' ? handleSignUp : undefined)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    Create an account
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default Unauthorized;
