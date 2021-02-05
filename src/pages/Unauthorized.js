import { useEffect } from 'react';
import { Button, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { openAuthDialog } from 'actions/auth';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Unauthorized can mean both unauthenticated and unauthorized. So when a user is not signed in,
 * a sign in button is displayed, otherwise just a general unauthorized message is shown
 */
const Unauthorized = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        document.title = 'Unauthorized - ORKG';
    }, []);

    const handleSignIn = () => {
        dispatch(openAuthDialog({ action: 'signin' }));
    };

    const handleSignUp = () => {
        dispatch(openAuthDialog({ action: 'signup' }));
    };

    return (
        <>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Authentication required</h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12 text-center">
                            <Icon icon={faLock} className="text-primary mt-3 mb-3" style={{ fontSize: 45 }} />
                            {user ? (
                                <div className="mb-4 lead">You need to be signed in to use this functionality</div>
                            ) : (
                                <>
                                    <h2 className="mb-4 h4">You need to sign in to continue</h2>
                                    <Button color="primary" className="mr-3" onClick={handleSignIn}>
                                        Sign in
                                    </Button>
                                </>
                            )}
                            <Link to={ROUTES.HOME}>
                                <Button color="primary" outline className="mr-3">
                                    Go to home
                                </Button>
                            </Link>
                            <div className="mt-4">
                                Not a member?{' '}
                                <span
                                    style={{
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        textDecoration: 'underline'
                                    }}
                                    onClick={handleSignUp}
                                    onKeyDown={e => (e.keyCode === 13 ? handleSignUp : undefined)}
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
