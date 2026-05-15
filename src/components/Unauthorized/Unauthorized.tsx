import { faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
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
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap items-stretch justify-center">
                            <div className="w-full md:shrink-0 md:grow-0 md:w-12/12 md:basis-12/12 md:max-w-12/12 text-center">
                                <FontAwesomeIcon icon={faLock} className="text-accent mt-4 mb-4" style={{ fontSize: 45 }} />
                                {user ? (
                                    <div className="mb-6 lead">You need to be signed in to use this functionality</div>
                                ) : (
                                    <>
                                        <h2 className="mb-6 text-2xl">You need to sign in to continue</h2>
                                        <Button color="primary" className="mr-4" onClick={handleSignIn}>
                                            Sign in
                                        </Button>
                                    </>
                                )}
                                <Link href={ROUTES.HOME}>
                                    <Button color="primary" outline className="mr-4">
                                        Go to home
                                    </Button>
                                </Link>
                                <div className="mt-6">
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
                </div>
            </Container>
        </>
    );
};

export default Unauthorized;
