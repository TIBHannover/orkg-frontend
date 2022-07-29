import { Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from 'reactstrap';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getUserInformation, updateUserInformation } from 'services/backend/users';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { updateAuth } from 'slices/authSlice';
import { getErrorMessage } from 'utils';
import { toast } from 'react-toastify';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.dark};
`;

class GeneralSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            display_name: '',
            email: '',
            loading: false,
            errors: null,
        };
    }

    componentDidMount() {
        this.getUserInformation();
    }

    getUserInformation = async () => {
        const userData = await getUserInformation();

        this.setState({
            display_name: userData.display_name,
            email: userData.email,
        });
    };

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleSave = async () => {
        const { email, display_name } = this.state;

        if (!display_name) {
            this.setState({
                errors: { message: 'Please fill out all fields' },
            });
            return;
        }

        this.setState({
            loading: true,
            errors: null,
        });

        updateUserInformation({
            email,
            display_name,
        })
            .then(response => {
                toast.success('Your changes have been saved successfully');
                this.props.updateAuth({ user: { ...this.props.user, displayName: display_name } });

                this.setState({
                    loading: false,
                    errors: null,
                });
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    errors: err,
                });
            });
    };

    render = () => (
        <>
            <h5 className="mb-4">General account settings</h5>
            {Boolean(getErrorMessage(this.state.errors)) && <Alert color="danger">{getErrorMessage(this.state.errors)}</Alert>}
            <Form>
                <FormGroup>
                    <Label for="display_name">Display name</Label>
                    <Input
                        onChange={this.handleInputChange}
                        value={this.state.display_name}
                        name="display_name"
                        id="display_name"
                        placeholder="Display name"
                        invalid={Boolean(getErrorMessage(this.state.errors, 'display_name'))}
                    />
                    {Boolean(getErrorMessage(this.state.errors, 'display_name')) && (
                        <FormFeedback>{getErrorMessage(this.state.errors, 'display_name')}</FormFeedback>
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
                    <Label for="Email">Avatar picture</Label>
                    <Alert color="info" className="d-flex align-items-center">
                        <StyledGravatar className="rounded-circle me-3" email={this.state.email} size={40} />
                        <p className="m-0">
                            We use Gravatar, a service that associates an avatar image with your primary email address.
                            <a className="ms-1" href="https://en.gravatar.com/" target="_blank" rel="noopener noreferrer">
                                Change your avatar image at gravatar.com <Icon size="sm" icon={faExternalLinkAlt} />
                            </a>
                        </p>
                    </Alert>
                </FormGroup>
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
            </Form>
        </>
    );
}

const mapDispatchToProps = dispatch => ({
    updateAuth: data => dispatch(updateAuth(data)),
});

const mapStateToProps = state => ({
    user: state.auth.user,
});

GeneralSettings.propTypes = {
    updateAuth: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GeneralSettings);
