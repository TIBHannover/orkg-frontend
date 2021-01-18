import { Component } from 'react';
import { Container, Button, FormGroup, Input, Label, Alert } from 'reactstrap';
import { createPredicate } from 'services/backend/predicates';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';

export default class AddProperty extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            value: '',
            /* Possible values: 'edit', 'loading'. */
            editorState: 'edit',
            propertyId: ''
        };
    }

    componentDidMount = () => {
        // Set document title
        document.title = 'Add property - ORKG';
    };

    setEditorState = editorState => {
        this.setState({ editorState: editorState });
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        if (this.state.value.trim()) {
            await this.createNewProperty();
        } else {
            toast.error('Please enter a property label');
            this.setEditorState('edit');
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value.trim() });
    };

    handleKeyUp = async event => {
        event.preventDefault();
        if (event.keyCode === 13) {
            await this.handleAdd();
        }
    };

    createNewProperty = async () => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            try {
                const responseJson = await createPredicate(value);
                const propertyId = responseJson.id;

                this.navigateToProperty(propertyId);
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                toast.error(`Error creating property ${error.message}`);
            }
        }
    };

    navigateToProperty = propertyId => {
        this.setEditorState('edit');
        this.setState({ propertyId: propertyId }, () => {
            this.setState({ redirect: true });
        });
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                propertyId: ''
            });

            return <Redirect to={reverse(ROUTES.PROPERTY, { id: this.state.propertyId })} />;
        }

        return (
            <>
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4">Create property</h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    <div className="pl-3 pr-3 pt-2">
                        {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}
                        <FormGroup>
                            <Label for="PropertyLabel">Property title</Label>
                            <Input
                                onChange={this.handleChange}
                                onKeyUp={this.handleKeyUp}
                                type="text"
                                name="value"
                                id="PropertyLabel"
                                disabled={loading}
                                placeholder="Property title"
                            />
                        </FormGroup>
                        <Button
                            color="primary"
                            onClick={() => {
                                this.handleAdd();
                            }}
                            className="mt-3 mb-2"
                            disabled={loading}
                        >
                            {!loading ? 'Create Property' : <span>Loading</span>}
                        </Button>
                    </div>
                </Container>
            </>
        );
    }
}

AddProperty.propTypes = {
    location: PropTypes.object.isRequired
};
