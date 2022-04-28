import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openAuthDialog, toggleAuthDialog } from 'slices/authSlice';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import ForgotPassword from './ForgotPassword';
import SignIn from './SignIn';
import SignUp from './SignUp';

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

class Authentication extends Component {
    render() {
        return (
            <>
                <Modal isOpen={this.props.dialogIsOpen} toggle={this.props.toggleAuthDialog}>
                    <ModalHeader toggle={this.props.toggleAuthDialog}>
                        {this.props.action === 'signin' && 'Sign in'}
                        {this.props.action === 'signup' && 'Sign up'}
                        {this.props.action === 'forgotpassword' && 'Forgot password'}
                    </ModalHeader>
                    <ModalBody>
                        <TransitionGroup exit={false}>
                            {this.props.action === 'signin' && (
                                <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                                    <SignIn />
                                </AnimationContainer>
                            )}
                            {this.props.action === 'signup' && (
                                <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                                    <SignUp changeMode={this.props.openAuthDialog} />
                                </AnimationContainer>
                            )}
                            {this.props.action === 'forgotpassword' && (
                                <AnimationContainer key={3} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                                    <ForgotPassword />
                                </AnimationContainer>
                            )}
                        </TransitionGroup>
                    </ModalBody>
                    <ModalFooter className="justify-content-center">
                        {this.props.action === 'signin' && (
                            <>
                                Not a member?
                                <Button
                                    className="p-0 my-0 ms-2"
                                    color="link"
                                    onClick={() => {
                                        this.props.openAuthDialog({ action: 'signup' });
                                    }}
                                >
                                    Create an account
                                </Button>
                            </>
                        )}
                        {this.props.action === 'signup' && (
                            <>
                                Already a member?
                                <Button
                                    className="p-0 my-0 ms-2"
                                    color="link"
                                    onClick={() => {
                                        this.props.openAuthDialog({ action: 'signin' });
                                    }}
                                >
                                    Sign in
                                </Button>
                            </>
                        )}
                        {/** Forgot password is currently not supported */}
                        {/*this.props.action === 'forgotpassword' && (
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
                                        this.props.openAuthDialog({ action: 'signin' });
                                    }}
                                >
                                    Login now
                                </b>
                            </div>
                        )*/}
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

const mapStateToProps = state => ({
    dialogIsOpen: state.auth.dialogIsOpen,
    action: state.auth.action
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload)),
    toggleAuthDialog: () => dispatch(toggleAuthDialog())
});

Authentication.propTypes = {
    action: PropTypes.string.isRequired,
    dialogIsOpen: PropTypes.bool.isRequired,
    toggleAuthDialog: PropTypes.func.isRequired,
    openAuthDialog: PropTypes.func.isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Authentication);
