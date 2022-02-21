import { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Button, Form, FormGroup, Input, Label, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import { createOrganization } from 'services/backend/organizations';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { openAuthDialog } from 'actions/auth';
import PropTypes from 'prop-types';
import REGEX from 'constants/regex';
import { connect } from 'react-redux';
import { reverse } from 'named-urls';
import { getPublicUrl } from 'utils';
import slugify from 'slugify';
import ROUTES from 'constants/routes';
import Tooltip from 'components/Utils/Tooltip';
import TitleBar from 'components/TitleBar/TitleBar';
import { MISC } from 'constants/graphSettings';

class AddOrganization extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            name: '',
            website: '',
            display_id: '',
            permalink: '',
            logo: '',
            editorState: 'edit',
            options: [
                { id: 'conference', label: MISC.CONFERENCE, requireDate: true },
                { id: 'general', label: MISC.GENERAL, requireDate: false },
                { id: 'journal', label: MISC.JOURNAL, requireDate: false }
            ],
            organizationType: { id: 'general', label: MISC.GENERAL, requireDate: false },
            date: '',
            isDoubleBlind: false
        };

        this.publicOrganizationRoute = `${getPublicUrl()}${reverse(ROUTES.ORGANIZATION, { id: ' ' })}`;
    }

    componentDidMount() {
        document.title = 'Create new organization - ORKG';
    }

    createNewOrganization = async () => {
        this.setState({ editorState: 'loading' });
        const { name, logo, website, permalink, organizationType, date, isDoubleBlind } = this.state;

        if (!name || name.length === 0) {
            toast.error(`Please enter an organization name`);
            this.setState({ editorState: 'edit' });
            return;
        }
        if (!new RegExp(REGEX.PERMALINK).test(permalink)) {
            toast.error(`Only underscores ( _ ), numbers, and letters are allowed in the permalink field`);
            this.setState({ editorState: 'edit' });
            return;
        }
        if (!new RegExp(REGEX.URL).test(website)) {
            toast.error(`Please enter a valid website URL`);
            this.setState({ editorState: 'edit' });
            return;
        }
        if (logo.length === 0) {
            toast.error(`Please upload an organization logo`);
            this.setState({ editorState: 'edit' });
            return;
        }

        if (organizationType.length === 0) {
            toast.error(`Please select an organization type`);
            this.setState({ editorState: 'edit' });
            return;
        }

        if (organizationType.requireDate && date.length === 0) {
            toast.error(`Please select conference date`);
            this.setState({ editorState: 'edit' });
            return;
        }

        try {
            const responseJson = await createOrganization(name, logo[0], this.props.user.id, website, permalink, organizationType, {
                date,
                is_double_blind: isDoubleBlind
            });
            this.navigateToOrganization(responseJson.display_id);
        } catch (error) {
            this.setState({ editorState: 'edit' });
            console.error(error);
            toast.error(`Error creating organization ${error.message}`);
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        if (event.target.name === 'name') {
            this.setState({
                // eslint-disable-next-line no-useless-escape
                permalink: slugify(event.target.value.trim(), { replacement: '_', remove: /[*+~%\\<>/;.(){}?,'"!:@\#\-^|]/g, lower: false })
            });
        }
    };

    navigateToOrganization = display_id => {
        this.setState({ editorState: 'edit', display_id: display_id }, () => {
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
                logo: [reader.result]
            });
        };
        reader.readAsDataURL(file);
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                name: '',
                display_id: '',
                website: '',
                permalink: ''
            });

            return <Redirect to={reverse(ROUTES.ORGANIZATION, { id: this.state.display_id })} />;
        }

        return (
            <>
                <TitleBar>Create new organization</TitleBar>
                <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                    {!!this.props.user && this.props.user.isCurationAllowed && (
                        <Form className="ps-3 pe-3 pt-2">
                            <FormGroup>
                                <Label for="organizationName">Name</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="name"
                                    id="organizationName"
                                    disabled={loading}
                                    value={this.state.name}
                                    placeholder="Organization name"
                                />
                            </FormGroup>

                            <FormGroup>
                                <div>
                                    <Label for="organizationPermalink">
                                        Permalink
                                        <Tooltip message="Permalink field allows to identify the organization page on ORKG in an easy-to-read form. Only underscores ( _ ), numbers, and letters are allowed." />
                                    </Label>
                                    <InputGroup>
                                        <span className="input-group-text">{this.publicOrganizationRoute}</span>
                                        <Input
                                            onChange={this.handleChange}
                                            type="text"
                                            name="permalink"
                                            id="organizationPermalink"
                                            disabled={loading}
                                            placeholder="name"
                                            value={this.state.permalink}
                                        />
                                    </InputGroup>
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label for="organizationWebsite">Website</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="website"
                                    id="organizationWebsite"
                                    disabled={loading}
                                    value={this.state.website}
                                    placeholder="https://www.example.com"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="organizationType">Type</Label>
                                <Input
                                    onChange={e => {
                                        this.setState({ organizationType: e ? JSON.parse(e.target.value) : '' });
                                    }}
                                    value={JSON.stringify(this.state.organizationType)}
                                    name="organizationType"
                                    type="select"
                                >
                                    {this.state.options.map(option => (
                                        <option key={option.id} value={JSON.stringify(option)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                            {this.state.organizationType.requireDate && (
                                <>
                                    <FormGroup>
                                        <Label for="conferenceDate">Conference date</Label>
                                        <Input
                                            onChange={this.handleChange}
                                            type="date"
                                            name="date"
                                            id="conferenceDate"
                                            value={this.state.date}
                                            placeholder="yyyy-mm-dd"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="doubleBlind" className="mb-0">
                                            Double blind
                                            <Tooltip message="By default the conference is selected as single blind." />
                                        </Label>{' '}
                                        <Input
                                            onChange={this.handleChange}
                                            type="checkbox"
                                            name="date"
                                            id="doubleBlind"
                                            value={this.state.date}
                                            placeholder="yyyy-mm-dd"
                                        />
                                    </FormGroup>
                                </>
                            )}
                            <FormGroup>
                                <Label for="organizationLogo">Logo</Label>
                                <br />
                                {this.state.logo.length > 0 && (
                                    <div className="mb-2">
                                        <img src={this.state.logo} style={{ width: '20%', height: '20%' }} alt="organization logo" />
                                    </div>
                                )}
                                <Input type="file" id="organizationLogo" onChange={this.handlePreview} />
                            </FormGroup>
                            <hr />
                            <div className="text-end">
                                <Button color="primary" onClick={this.createNewOrganization} className="mb-2" disabled={loading}>
                                    {!loading ? 'Create organization' : <span>Loading</span>}
                                </Button>
                            </div>
                        </Form>
                    )}

                    {(!!!this.props.user || !this.props.user.isCurationAllowed) && (
                        <>
                            <Button color="link" className="p-0 mb-2 mt-2 clearfix" onClick={() => this.props.openAuthDialog({ action: 'signin' })}>
                                <Icon className="me-1" icon={faUser} /> Signin to create organization
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
