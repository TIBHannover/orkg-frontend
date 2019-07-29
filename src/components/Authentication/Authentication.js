import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openAuthDialog, toggleAuthDialog } from '../../actions/auth';
import { CSSTransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import ForgotPassword from './ForgotPassword';
import SignIn from './SignIn';
import SignUp from './SignUp';

const AnimationContainer = styled.div`
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
            <CSSTransitionGroup
              transitionName="fadeIn"
              transitionEnterTimeout={700}
              transitionLeave={false}
            >
              {this.props.action === 'signin' && (
                <AnimationContainer>
                  <SignIn />
                </AnimationContainer>
              )}
              {this.props.action === 'signup' && (
                <AnimationContainer>
                  <SignUp changeMode={this.props.openAuthDialog} />
                </AnimationContainer>
              )}
              {this.props.action === 'forgotpassword' && (
                <AnimationContainer>
                  <ForgotPassword />
                </AnimationContainer>
              )}
            </CSSTransitionGroup>
          </ModalBody>
          <ModalFooter className="justify-content-center">
            {this.props.action === 'signin' && (
              <div>
                Not a member?
                <span
                  className="ml-2"
                  style={{
                    cursor: 'pointer',
                    color: 'inherit',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    this.props.openAuthDialog('signup');
                  }}
                >
                  Create an account
                </span>
              </div>
            )}
            {this.props.action === 'signup' && (
              <div>
                Already a member?
                <span
                  className="ml-2"
                  style={{
                    cursor: 'pointer',
                    color: 'inherit',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    this.props.openAuthDialog('signin');
                  }}
                >
                  Sign in
                </span>
              </div>
            )}
            {this.props.action === 'forgotpassword' && (
              <div>
                Remember you password again ?
                <b
                  className="ml-2"
                  style={{
                    cursor: 'pointer',
                    color: 'inherit',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    this.props.openAuthDialog('signin');
                  }}
                >
                  Login now
                </b>
              </div>
            )}
          </ModalFooter>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  dialogIsOpen: state.auth.dialogIsOpen,
  action: state.auth.action,
});

const mapDispatchToProps = (dispatch) => ({
  openAuthDialog: (action) => dispatch(openAuthDialog(action)),
  toggleAuthDialog: () => dispatch(toggleAuthDialog()),
});

Authentication.propTypes = {
  action: PropTypes.string.isRequired,
  dialogIsOpen: PropTypes.bool.isRequired,
  toggleAuthDialog: PropTypes.func.isRequired,
  openAuthDialog: PropTypes.func.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Authentication);
