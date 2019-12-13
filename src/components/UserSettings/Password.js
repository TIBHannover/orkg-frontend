import { Row, Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from 'reactstrap';
import React, { Component } from 'react';
import { updateUserPassword } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { get_error_message } from 'utils';
import { toast } from 'react-toastify';

class Password extends Component {
    constructor(props) {
        super(props);

        this.state = {
            current_password: '',
            new_password: '',
            new_matching_password: '',
            loading: false,
            errors: null
        };
    }

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSave = async () => {
        const { current_password, new_password, new_matching_password } = this.state;

        if (!current_password || !new_password || !new_matching_password) {
            this.setState({
                errors: { message: 'Please fill out all fields' }
            });
            return;
        }

        if (new_password !== new_matching_password) {
            this.setState({
                errors: { message: 'The new passwords are not matching' }
            });
            return;
        }
        this.setState({
            loading: true,
            errors: null
        });

        updateUserPassword({
            current_password,
            new_password,
            new_matching_password
        })
            .then(response => {
                toast.success('Your changes have been saved successfully');
                this.setState({
                    errors: '',
                    loading: false,
                    current_password: '',
                    new_password: '',
                    new_matching_password: ''
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
            <h5 className="mb-4">Change password</h5>
            {Boolean(get_error_message(this.state.errors)) && <Alert color="danger">{get_error_message(this.state.errors)}</Alert>}
            <Form>
                <FormGroup>
                    <Label for="current_password">Current password</Label>
                    <Input
                        onChange={this.handleInputChange}
                        value={this.state.current_password}
                        type="password"
                        name="current_password"
                        id="current_password"
                        placeholder="Current password"
                        invalid={Boolean(get_error_message(this.state.errors, 'current_password'))}
                    />
                    {Boolean(get_error_message(this.state.errors, 'current_password')) && (
                        <FormFeedback>{get_error_message(this.state.errors, 'current_password')}</FormFeedback>
                    )}
                </FormGroup>
                <Row>
                    <div className={'col-6'}>
                        <FormGroup>
                            <Label for="new_password">New password</Label>
                            <Input
                                onChange={this.handleInputChange}
                                value={this.state.new_password}
                                type="password"
                                name="new_password"
                                id="new_password"
                                placeholder="New password"
                                invalid={Boolean(get_error_message(this.state.errors, 'new_password'))}
                            />
                            {Boolean(get_error_message(this.state.errors, 'new_password')) && (
                                <FormFeedback>{get_error_message(this.state.errors, 'new_password')}</FormFeedback>
                            )}
                        </FormGroup>
                    </div>
                    <div className={'col-6'}>
                        <FormGroup>
                            <Label for="matching_password">Repeat new password</Label>
                            <Input
                                onChange={this.handleInputChange}
                                value={this.state.new_matching_password}
                                type="password"
                                name="new_matching_password"
                                id="new_matching_password"
                                placeholder="Confirm new password"
                                invalid={Boolean(get_error_message(this.state.errors, 'new_matching_password'))}
                            />
                            {Boolean(get_error_message(this.state.errors, 'new_matching_password')) && (
                                <FormFeedback>{get_error_message(this.state.errors, 'new_matching_password')}</FormFeedback>
                            )}
                        </FormGroup>
                    </div>
                </Row>
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

export default Password;
