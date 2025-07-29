import { faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { Container } from 'reactstrap';

import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ROUTES from '@/constants/routes';

/**
 * Unauthorized can mean both unauthenticated and unauthorized. So when a user is not signed in,
 * a sign in button is displayed, otherwise just a general unauthorized message is shown
 */
const Unauthorized = () => {
    const { user } = useAuthentication();

    useEffect(() => {
        document.title = 'Unauthorized - ORKG';
    }, []);

    const handleSignIn = () => {
        signIn('keycloak');
    };

    const handleSignUp = () => {
        signIn('keycloak');
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
