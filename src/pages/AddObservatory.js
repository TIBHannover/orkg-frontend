import React, { Component } from 'react';
import { createObservatory } from 'network';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { openAuthDialog } from 'actions/auth';
import { connect } from 'react-redux';

class AddObservatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            value: '',
            observatoryId: ''
        };
    }

    createNewObservatory = async () => {
        this.setState({ editorState: 'loading' });
        const value = this.state.value;
        if (value && value.length !== 0) {
            try {
                const observatory = await createObservatory(value, this.props.match.params.id);
                this.navigateToObservatory(observatory.id);
            } catch (error) {
                this.setState({ editorState: 'edit' });
                console.error(error);
                toast.error(`Error creating observatory ${error.message}`);
            }
        } else {
            toast.error(`Please enter an observatory name`);
            this.setState({ editorState: 'edit' });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value.trim() });
    };

    handleKeyUp = async event => {
        event.preventDefault();
        if (event.keyCode === 13) {
            await this.createNewObservatory();
        }
    };

    navigateToObservatory = observatoryId => {
        this.setState({ editorState: 'edit', observatoryId: observatoryId }, () => {
            this.setState({ redirect: true });
        });
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                observatoryId: ''
            });

            return <Redirect to={reverse(ROUTES.OBSERVATORY, { id: this.state.observatoryId })} />;
        }

        return (
            <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5">
                {this.props.user ? (
                    <Form className="pl-3 pr-3 pt-2">
                        {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}
                        <FormGroup>
                            <Label for="ObservatoryLabel">Observatory name</Label>
                            <Input
                                onChange={this.handleChange}
                                onKeyUp={this.handleKeyUp}
                                type="text"
                                name="value"
                                id="ObservatoryLabel"
                                disabled={loading}
                                placeholder="Observatory name"
                            />
                        </FormGroup>
                        <Button color="primary" onClick={this.createNewObservatory} outline className="mt-4 mb-2" block disabled={loading}>
                            {!loading ? 'Create Observatory' : <span>Loading</span>}
                        </Button>
                    </Form>
                ) : (
                    <>
                        <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => this.props.openAuthDialog('signin')}>
                            <Icon className="mr-1" icon={faUser} /> Signin to create an observatory
                        </Button>
                    </>
                )}
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: action => dispatch(openAuthDialog(action))
});

AddObservatory.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddObservatory);
