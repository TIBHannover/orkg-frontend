import { Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from 'reactstrap';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getUserInformation, updateUserInformation } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { updateAuth } from '../../actions/auth';
import { get_error_message } from 'utils';
import { toast } from 'react-toastify';

class GeneralSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            display_name: '',
            email: '',
            organization: '',
            bio: '',
            loading: false,
            errors: null
        };
    }

    componentDidMount() {
        this.getUserInformation();
    }

    getUserInformation = async () => {
        const userData = await getUserInformation();

        this.setState({
            display_name: userData.display_name,
            email: userData.email
        });
    };

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSave = async () => {
        const { email, display_name } = this.state;

        if (!display_name) {
            this.setState({
                errors: { message: 'Please fill out all fields' }
            });
            return;
        }

        this.setState({
            loading: true,
            errors: null
        });

        updateUserInformation({
            email,
            display_name
        })
            .then(response => {
                toast.success('Your changes have been saved successfully');
                this.props.updateAuth({ user: { displayName: display_name } });

                this.setState({
                    loading: false,
                    errors: null
                });
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    errors: err
                });
            });
    };

    render = () => (
        <>
            <h5 className="mb-4">General account settings</h5>
            {Boolean(get_error_message(this.state.errors)) && <Alert color="danger">{get_error_message(this.state.errors)}</Alert>}
            <Form>
                <FormGroup>
                    <Label for="display_name">Display name</Label>
                    <Input
                        onChange={this.handleInputChange}
                        value={this.state.display_name}
                        name="display_name"
                        id="display_name"
                        placeholder="Display name"
                        invalid={Boolean(get_error_message(this.state.errors, 'display_name'))}
                    />
                    {Boolean(get_error_message(this.state.errors, 'display_name')) && (
                        <FormFeedback>{get_error_message(this.state.errors, 'display_name')}</FormFeedback>
                    )}
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
                        disabled
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="Email">Avatar Picture</Label>
                    <p>
                        We use Gravatar, a service that associates an avatar image with your primary email address.
                        <a className="ml-1" href="https://en.gravatar.com/" target="_blank" rel="noopener noreferrer">
                            Change your avatar image at gravatar.com <Icon size="sm" icon={faExternalLinkAlt} />
                        </a>
                    </p>
                </FormGroup>
                {/*
                <FormGroup>
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

export default connect(
    null,
    mapDispatchToProps
)(GeneralSettings);
