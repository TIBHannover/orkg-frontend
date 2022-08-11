import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { Component } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleAuthDialog } from 'slices/authSlice';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
        };
    }

    handleInputChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    resetPasswordPassword = () => {
        this.props.toggleAuthDialog();
    };

    render() {
        return (
            <>
                <Form className="ps-3 pe-3 pt-2">
                    <Alert color="info">If you forgot your password, you can reset it via your email address</Alert>
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
                    <Button
                        onClick={() => {
                            this.resetPasswordPassword();
                        }}
                        color="primary"
                        className="mt-4 mb-2"
                        block
                    >
                        Reset password
                    </Button>
                </Form>
            </>
        );
    }
}

ForgotPassword.propTypes = {
    toggleAuthDialog: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    toggleAuthDialog: () => dispatch(toggleAuthDialog()),
});

export default connect(
    null,
    mapDispatchToProps,
)(ForgotPassword);
