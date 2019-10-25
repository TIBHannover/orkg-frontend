import { Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleAuthDialog, updateAuth } from '../../actions/auth';
import { registerWithEmailAndPassword } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      password: '',
      loading: false,
      error: null,
    };
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  signUp = async () => {
    const { email, password, name} = this.state;
    
    if (!email || !password || !name) {
      this.setState({
        error: 'Please fill out all fields',
      });
      return;
    }

    this.setState({
      loading: true,
    });

    registerWithEmailAndPassword(email, password, name).then(()=> {
      this.setState({
        loading: false,
        error: null
      });
      this.props.updateAuth({ user: { displayName: 'John Doe', email: '', id: 1 } });
      this.props.toggleAuthDialog();
    }).catch((e)=> {
      this.setState({
        loading: false,
        error: 'An error has occurred, please try again'
      });
    });
  };

  render() {
    return (
      <>
        <Form className="pl-3 pr-3 pt-2">
          {this.state.error && (
            <Alert color="danger">
              {this.state.error}
            </Alert>)
          }
          <FormGroup>
            <Label for="name">Display name</Label>
            <Input
              onChange={this.handleInputChange}
              value={this.state.name}
              type="text"
              name="name"
              id="name"
              placeholder="Name"
            />
          </FormGroup>
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
            <Label for="Password">Password</Label>
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
              this.signUp();
            }}
            className="mt-4 mb-2"
            block
            disabled={this.state.loading}
          >
            {!this.state.loading ? 'Sign up' : <span><Icon icon={faSpinner} spin /> Loading</span>}
          </Button>
        </Form>
      </>
    );
  }
}

SignUp.propTypes = {
  updateAuth: PropTypes.func.isRequired,
  toggleAuthDialog: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  updateAuth: (data) => dispatch(updateAuth(data)),
  toggleAuthDialog: () => dispatch(toggleAuthDialog()),
});

export default connect(
  null,
  mapDispatchToProps,
)(SignUp);
