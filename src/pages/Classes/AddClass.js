import { Component } from 'react';
import { Container, Button, FormGroup, Input, Label, Alert } from 'reactstrap';
import { createClass } from 'services/backend/classes';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';

export default class AddClass extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            value: '',
            /* Possible values: 'edit', 'loading'. */
            editorState: 'edit',
            classId: ''
        };
    }

    componentDidMount = () => {
        // Set document title
        document.title = 'Add Class - ORKG';
    };

    setEditorState = editorState => {
        this.setState({ editorState: editorState });
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        if (this.state.value.trim()) {
            await this.createNewClass();
        } else {
            toast.error('Please enter a class label');
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

    createNewClass = async () => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            try {
                const responseJson = await createClass(value);
                const classId = responseJson.id;

                this.navigateToClass(classId);
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                toast.error(`Error creating class ${error.message}`);
            }
        }
    };

    navigateToClass = classId => {
        this.setEditorState('edit');
        this.setState({ classId: classId }, () => {
            this.setState({ redirect: true });
        });
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                classId: ''
            });

            return <Redirect to={reverse(ROUTES.CLASS, { id: this.state.classId })} />;
        }

        return (
            <>
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4">Create class</h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    <div className="pl-3 pr-3 pt-2">
                        {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}
                        <FormGroup>
                            <Label for="classLabel">Class title</Label>
                            <Input
                                onChange={this.handleChange}
                                onKeyUp={this.handleKeyUp}
                                type="text"
                                name="value"
                                id="classLabel"
                                disabled={loading}
                                placeholder="Class title"
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
                            {!loading ? 'Create Class' : <span>Loading</span>}
                        </Button>
                    </div>
                </Container>
            </>
        );
    }
}

AddClass.propTypes = {
    location: PropTypes.object.isRequired
};
