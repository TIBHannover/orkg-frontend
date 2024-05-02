import ForgotPassword from 'components/Authentication/ForgotPassword';
import SignIn from 'components/Authentication/SignIn';
import SignUp from 'components/Authentication/SignUp';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { openAuthDialog, toggleAuthDialog } from 'slices/authSlice';
import styled from 'styled-components';
import usePathname from 'components/NextJsMigration/usePathname';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

function Authentication() {
    const dispatch = useDispatch();
    const { dialogIsOpen, action, user } = useSelector((state) => state.auth);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isEditMode = searchParams.get('isEditMode') === 'true';

    return (
        <Modal
            isOpen={dialogIsOpen}
            toggle={() => {
                dispatch(toggleAuthDialog());
                if (!user && isEditMode && dialogIsOpen) {
                    const current = new URLSearchParams(Array.from(searchParams.entries()));
                    current.set('isEditMode', !isEditMode);
                    const search = current.toString();
                    const query = search ? `?${search}` : '';
                    router.push(`${pathname}${query}`);
                }
            }}
        >
            <ModalHeader toggle={() => dispatch(toggleAuthDialog())}>
                {action === 'signin' && 'Sign in'}
                {action === 'signup' && 'Sign up'}
                {action === 'forgotpassword' && 'Forgot password'}
            </ModalHeader>
            <ModalBody>
                <TransitionGroup exit={false}>
                    {action === 'signin' && (
                        <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                            <SignIn />
                        </AnimationContainer>
                    )}
                    {action === 'signup' && (
                        <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                            <SignUp changeMode={openAuthDialog} />
                        </AnimationContainer>
                    )}
                    {action === 'forgotpassword' && (
                        <AnimationContainer key={3} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                            <ForgotPassword />
                        </AnimationContainer>
                    )}
                </TransitionGroup>
            </ModalBody>
            <ModalFooter className="justify-content-center">
                {action === 'signin' && (
                    <>
                        Not a member?
                        <Button
                            className="p-0 my-0 ms-2"
                            color="link"
                            onClick={() => {
                                dispatch(openAuthDialog({ action: 'signup' }));
                            }}
                        >
                            Create an account
                        </Button>
                    </>
                )}
                {action === 'signup' && (
                    <>
                        Already a member?
                        <Button
                            className="p-0 my-0 ms-2"
                            color="link"
                            onClick={() => {
                                dispatch(openAuthDialog({ action: 'signin' }));
                            }}
                        >
                            Sign in
                        </Button>
                    </>
                )}
                {/** Forgot password is currently not supported */}
                {/* action === 'forgotpassword' && (
                            <div>
                                Remember you password again ?
                                <b
                                    className="ms-2"
                                    style={{
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        textDecoration: 'underline'
                                    }}
                                    onClick={() => {
                                         dispatch(openAuthDialog({ action: 'signin' }));
                                    }}
                                >
                                    Login now
                                </b>
                            </div>
                        ) */}
            </ModalFooter>
        </Modal>
    );
}

export default Authentication;
