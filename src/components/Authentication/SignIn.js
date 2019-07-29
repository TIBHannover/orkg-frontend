import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openAuthDialog, toggleAuthDialog, updateAuth } from '../../actions/auth';

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  signInWithEmailAndPassword = () =>
    Promise.all([this.props.updateAuth({ user: { displayName: 'John Doe', id: 1 } })]).then(() => {
      this.props.toggleAuthDialog();
    });

  render() {
    return (
      <>
        <Form className="pl-3 pr-3 pt-2">
          <FormGroup>
            <Label for="Email">Email address</Label>
            <Input
              onChange={this.handleInputChange}
              value={this.state.email}
              type="email"
              name="email"
              id="Email"
              placeholder="Email address"
            />
          </FormGroup>
          <FormGroup>
            <Label for="Password">
              Password{' '}
              <span
                className="ml-1"
                style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
                onClick={() => {
                  this.props.openAuthDialog('forgotpassword');
                }}
              >
                Forgot?
              </span>
            </Label>
            <Input
              onChange={this.handleInputChange}
              value={this.state.password}
              type="password"
              name="password"
              id="Password"
              placeholder="Password"
            />
          </FormGroup>
          <Button
            color="primary"
            onClick={() => {
              this.signInWithEmailAndPassword();
            }}
            className="mt-4 mb-2"
            block
          >
            Sign in
          </Button>
        </Form>
      </>
    );
  }
}

SignIn.propTypes = {
  openAuthDialog: PropTypes.func.isRequired,
  updateAuth: PropTypes.func.isRequired,
  toggleAuthDialog: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  openAuthDialog: (action) => dispatch(openAuthDialog(action)),
  updateAuth: (data) => dispatch(updateAuth(data)),
  toggleAuthDialog: () => dispatch(toggleAuthDialog()),
});

export default connect(
  null,
  mapDispatchToProps,
)(SignIn);
