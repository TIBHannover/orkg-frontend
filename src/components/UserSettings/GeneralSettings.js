import { Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getUserInformation, updateUserInformation } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { updateAuth } from '../../actions/auth';
import { toast } from 'react-toastify';

class GeneralSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayName: '',
            email: '',
            organization: '',
            bio: '',
            loading: false,
            error: null
        };
    }

    componentDidMount() {
        this.getUserInformation();
    }

    getUserInformation = async () => {
        const userData = await getUserInformation();

        this.setState({
            displayName: userData.display_name,
            email: userData.email
        });
    };

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSave = async () => {
        const { email, displayName } = this.state;

        if (!email || !displayName) {
            this.setState({
                error: 'Please fill out all fields'
            });
            return;
        }

        this.setState({
            loading: true
        });

        try {
            await updateUserInformation({
                email,
                displayName
            });
        } catch (err) {
            /*
      TODO: enable this code, but backend is currently returning an error
      this.setState({
        error: 'Something went wrong, please try again',
        loading: false,
      });
      return;*/
        }
        toast.success('Your changes have been saved successfully');

        this.props.updateAuth({ user: { displayName: displayName } });

        this.setState({
            loading: false,
            error: ''
        });
    };

    render = () => (
        <>
            <h5 className="mb-4">General account settings</h5>
            {this.state.error && <Alert color="danger">{this.state.error}</Alert>}
            <Form>
                <FormGroup>
                    <Label for="displayName">Display name</Label>
                    <Input
                        onChange={this.handleInputChange}
                        value={this.state.displayName}
                        type="email"
                        name="displayName"
                        id="displayName"
                        placeholder="Display name"
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
                {/*<FormGroup>
          <Label for="organization">Organization</Label>
          <Input
            onChange={this.handleInputChange}
            value={this.state.organization}
            type="text"
            name="organization"
            id="organization"
            placeholder="Organization"
          />
        </FormGroup>
        <FormGroup>
          <Label for="bio">Bio</Label>
          <Input
            onChange={this.handleInputChange}
            value={this.state.bio}
            type="textarea"
            name="bio"
            id="bio"
            placeholder="Bio"
          />
        </FormGroup>*/}
                <Button
                    color="primary"
                    onClick={() => {
                        this.handleSave();
                    }}
                    className="mt-4 mb-2"
                >
                    {!this.state.loading ? (
                        'Save changes'
                    ) : (
                        <span>
                            <Icon icon={faSpinner} spin /> Loading
                        </span>
                    )}
                </Button>
                {/*<span
          onClick={() => {
            this.toggleTab('delete');
          }}
          className="pull-right mt-4 mb-2 text-danger btn"
        >
          Delete account
        </span>*/}
            </Form>
        </>
    );
}

const mapDispatchToProps = dispatch => ({
    updateAuth: data => dispatch(updateAuth(data))
});

GeneralSettings.propTypes = {
    updateAuth: PropTypes.func.isRequired
};

export default connect(null, mapDispatchToProps)(GeneralSettings);
