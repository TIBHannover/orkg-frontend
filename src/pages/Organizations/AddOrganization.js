import { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { createOrganization } from 'services/backend/organizations';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { openAuthDialog } from 'actions/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

class AddOrganization extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            value: '',
            url: '',
            organizationId: '',
            previewSrc: '',
            organizationNamedUrl: '',
            editorState: 'edit'
        };
    }

    componentDidMount() {
        document.title = 'Create new organization - ORKG';
    }

    createNewOrganization = async () => {
        this.setState({ editorState: 'loading' });
        const value = this.state.value;
        const image = this.state.previewSrc;
        const url = this.state.url;
        const namedUrl = this.state.organizationNamedUrl;
        const regex = /^[A-Za-z0-9-_]+$/;

        if (value && value.length !== 0) {
            if (url && url.match(/[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi)) {
                if (image.length !== 0) {
                    if (regex.test(namedUrl)) {
                        try {
                            const responseJson = await createOrganization(value, image[0], this.props.user.id, url, namedUrl);
                            const organizationId = responseJson.uri_name;
                            this.navigateToOrganization(organizationId);
                        } catch (error) {
                            this.setState({ editorState: 'edit' });
                            console.error(error);
                            toast.error(`Error creating organization ${error.message}`);
                        }
                    } else {
                        toast.error(`Please enter a valid named URL`);
                        this.setState({ editorState: 'edit' });
                    }
                } else {
                    toast.error(`Please upload an organization logo`);
                    this.setState({ editorState: 'edit' });
                }
            } else {
                toast.error(`Please enter a valid URL`);
                this.setState({ editorState: 'edit' });
            }
        } else {
            toast.error(`Please enter an organization name`);
            this.setState({ editorState: 'edit' });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value.trim() });
        console.log(event.target.name);
        if (event.target.name === 'value') {
            this.setState({
                organizationNamedUrl: event.target.value
                    .trim()
                    .replace(/['"]+/g, '')
                    .replace(/ /g, '_')
            });
        }
    };

    navigateToOrganization = organizationId => {
        this.setState({ editorState: 'edit', organizationId: organizationId }, () => {
            this.setState({ redirect: true });
        });
    };

    handlePreview = async e => {
        e.preventDefault();

        const file = e.target.files[0];
        const reader = new FileReader();

        if (e.target.files.length === 0) {
            return;
        }

        reader.onloadend = e => {
            this.setState({
                previewSrc: [reader.result]
            });
        };

        reader.readAsDataURL(file);
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                organizationId: '',
                url: ''
            });

            return <Redirect to={reverse(ROUTES.ORGANIZATION, { id: this.state.organizationId })} />;
        }

        return (
            <>
                <Container className="d-flex align-items-center">
                    <h3 className="h4 my-4 flex-grow-1">Create new organization</h3>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    {!!this.props.user && this.props.user.isCurationAllowed ? (
                        <Form className="pl-3 pr-3 pt-2">
                            {this.state.errors && <Alert color="danger">{this.state.errors}</Alert>}
                            <FormGroup>
                                <Label for="ResourceLabel">Organization Name</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="value"
                                    id="ResourceLabel"
                                    disabled={loading}
                                    placeholder="Organization Name"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label for="OrganizationURL">Organization Named URL</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="organizationNamedUrl"
                                    id="OrganizationUrl"
                                    disabled={loading}
                                    placeholder="Organization URL"
                                    value={this.state.organizationNamedUrl}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label for="OrganizationUrl">Organization URL</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="url"
                                    id="OrganizationUrl"
                                    disabled={loading}
                                    placeholder="https://www.example.com"
                                />
                            </FormGroup>
                            <div>
                                <img src={this.state.previewSrc} style={{ width: '20%', height: '20%' }} className="Avatar" alt="" />
                            </div>
                            <FormGroup>
                                <Label>Logo</Label>
                                <br />
                                <Input type="file" onChange={this.handlePreview} />
                            </FormGroup>

                            <Button color="primary" onClick={this.createNewOrganization} outline className="mt-4 mb-2" block disabled={loading}>
                                {!loading ? 'Create Organization' : <span>Loading</span>}
                            </Button>
                        </Form>
                    ) : (
                        <>
                            <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => this.props.openAuthDialog({ action: 'signin' })}>
                                <Icon className="mr-1" icon={faUser} /> Signin to create organization
                            </Button>
                        </>
                    )}
                </Container>
            </>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload))
});

AddOrganization.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddOrganization);
