import { Row, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import React, { Component } from 'react';
import { updateUserPassword } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

class Password extends Component {
    constructor(props) {
        super(props);

        this.state = {
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            loading: false,
            error: null
        };
    }

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSave = async () => {
        const { oldPassword, newPassword, confirmNewPassword } = this.state;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            this.setState({
                error: 'Please fill out all fields'
            });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.setState({
                error: 'The new passwords are not matching'
            });
            return;
        }

        this.setState({
            loading: true
        });

        try {
            await updateUserPassword({
                oldPassword,
                newPassword,
                confirmNewPassword
            });
        } catch (err) {
            console.log(err);
            this.setState({
                error: 'Something went wrong, please try again',
                loading: false
            });
            return;
        }
        toast.success('Your changes have been saved successfully');

        this.setState({
            error: '',
            loading: false,
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        });
    };

    render = () => (
        <>
            <h5 className="mb-4">Change password</h5>
            {this.state.error && <Alert color="danger">{this.state.error}</Alert>}
            <Form>
                <FormGroup>
                    <Label for="password">Current password</Label>
                    <Input
                        onChange={this.handleInputChange}
                        value={this.state.password}
                        type="password"
                        name="oldPassword"
                        id="oldPassword"
                        placeholder="Current password"
                    />
                </FormGroup>
                <Row>
                    <div className={'col-6'}>
                        <FormGroup>
                            <Label for="newPassword">New password</Label>
                            <Input
                                onChange={this.handleInputChange}
                                value={this.state.newPassword}
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                placeholder="New password"
                            />
                        </FormGroup>
                    </div>
                    <div className={'col-6'}>
                        <FormGroup>
                            <Label for="confirmNewPassword">Repeat new password</Label>
                            <Input
                                onChange={this.handleInputChange}
                                value={this.state.confirmNewPassword}
                                type="password"
                                name="confirmNewPassword"
                                id="confirmNewPassword"
                                placeholder="Confirm new password"
                            />
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
