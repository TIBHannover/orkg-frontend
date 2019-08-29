import { Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { openAuthDialog, toggleAuthDialog, updateAuth } from '../../actions/auth';
import { signInWithEmailAndPassword } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Cookies } from 'react-cookie';
const cookies = new Cookies();

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      loading: false,
      errors: null
    };
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  signIn = async () => {
    this.setState({
      loading: true,
    });

    signInWithEmailAndPassword(this.state.email, this.state.password, this.state.name).then(
      (token) => {
        cookies.set('token', token.access_token, { path: '/' });
        this.props.toggleAuthDialog();
        this.setState({ loading: false });
        window.location.reload();
      }
    ).catch((e) => {
      console.log(e);
      this.setState({ loading: false, errors: e.error_description ? e.error_description : 'Something went wrong, please try again.' });
    });
  }

  render() {
    return (
      <>
        <Form className="pl-3 pr-3 pt-2">
          {this.state.errors && (
            <Alert color="danger">
              {this.state.errors}
            </Alert>)
          }
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
              this.signIn();
            }}
            className="mt-4 mb-2"
            block
            disabled={this.state.loading}
          >
            {!this.state.loading ? 'Sign in' : <span><Icon icon={faSpinner} spin /> Loading</span>}
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
