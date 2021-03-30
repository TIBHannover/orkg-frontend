import { Component } from 'react';
import { Container, Button, FormGroup, Input, Label, InputGroup, InputGroupAddon } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';
import { getOrganization } from 'services/backend/organizations';
import { createObservatory } from 'services/backend/observatories';
import NotFound from 'pages/NotFound';
import InternalServerError from 'pages/InternalServerError';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES, CLASSES } from 'constants/graphSettings';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { openAuthDialog } from 'actions/auth';
import { connect } from 'react-redux';
import slugify from 'slugify';
import Tooltip from 'components/Utils/Tooltip';

const publicObservatoryRoute = `${window.location.protocol}//${window.location.host}${window.location.pathname
    .replace(reverse(ROUTES.ADD_OBSERVATORY), reverse(ROUTES.OBSERVATORY, { id: ' ' }))
    .replace(/\/$/, '')}`;

class AddObservatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            value: '',
            description: '',
            display_id: '',
            researchField: '',
            organizationName: '',
            permalink: '',
            isLoadingOrganization: true,
            errorLoadingOrganization: null
        };
    }

    componentDidMount() {
        this.getOrganization(this.props.match.params.id);
    }

    getOrganization = id => {
        this.setState({ isLoadingOrganization: true });
        getOrganization(id)
            .then(organization => {
                document.title = `${organization.name} - ORKG`;
                this.setState({ organizationName: organization.name, isLoadingOrganization: false });
            })
            .catch(err => {
                this.setState({ organizationName: '', isLoadingOrganization: false, errorLoadingOrganization: err });
                console.error(err);
            });
    };

    createNewObservatory = async () => {
        this.setState({ editorState: 'loading' });
        const value = this.state.value;
        const description = this.state.description;
        const researchField = this.state.researchField.id;
        const uriName = this.state.url;
        const regex = /^[a-z0-9-]+$/;

        if (value && value.length !== 0 && description && description.length !== 0 && researchField && uriName.length !== 0 && regex.test(uriName)) {
            try {
                const observatory = await createObservatory(value, this.props.match.params.id, description, researchField, uriName);
                this.navigateToObservatory(observatory.display_id);
            } catch (error) {
                this.setState({ editorState: 'edit' });
                console.error(error);
                toast.error(`Error creating observatory ${error.message}`);
            }
        } else {
            toast.error(`Please enter an observatory name, description, research field and valid URL`);
            this.setState({ editorState: 'edit' });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value.trim() });
        if (event.target.name === 'value') {
            this.setState({
                permalink: slugify(event.target.value.trim(), { replacement: '-', remove: /[*+~%\<>/;.(){}?,'"!:@#_^|]/g, lower: false })
            });
        }
    };

    navigateToObservatory = display_id => {
        this.setState({ editorState: 'edit', display_id: display_id }, () => {
            this.setState({ redirect: true });
        });
    };

    render() {
        const loading = this.state.editorState === 'loading';
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                display_id: ''
            });

            return <Redirect to={reverse(ROUTES.OBSERVATORY, { id: this.state.display_id })} />;
        }

        return (
            <>
                {this.state.isLoadingOrganization && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoadingOrganization && this.state.errorLoadingOrganization && (
                    <>{this.state.errorLoadingOrganization.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>
                )}
                {!this.state.isLoadingOrganization && !this.state.errorLoadingOrganization && (
                    <>
                        <Container className="d-flex align-items-center">
                            <h3 className="h4 my-4 flex-grow-1">Create an Observatory in {this.state.organizationName}</h3>
                        </Container>

                        <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                            {this.props.user ? (
                                <div className="pl-3 pr-3 pt-2">
                                    <FormGroup>
                                        <Label for="ObservatoryLabel">Observatory name</Label>
                                        <Input
                                            onChange={this.handleChange}
                                            type="text"
                                            name="value"
                                            id="ObservatoryLabel"
                                            disabled={loading}
                                            placeholder="Observatory name"
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <div>
                                            <Label for="observatoryPermalink">
                                                Permalink
                                                <Tooltip message="Permalink field allows to identify the observatory page on ORKG in an easy-to-read form. Only dashes ( - ) and lower case letters are allowed" />
                                            </Label>
                                            <InputGroup>
                                                <InputGroupAddon addonType="prepend">{publicObservatoryRoute}</InputGroupAddon>
                                                <Input
                                                    onChange={this.handleChange}
                                                    type="text"
                                                    name="permalink"
                                                    id="ObservatoryURL"
                                                    disabled={loading}
                                                    placeholder="name"
                                                    value={this.state.permalink}
                                                />
                                            </InputGroup>
                                        </div>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="ObservatoryResearchField">Research Field</Label>
                                        <AutoComplete
                                            entityType={ENTITIES.RESOURCE}
                                            optionsClass={CLASSES.RESEARCH_FIELD}
                                            placeholder="Observatory research field"
                                            onItemSelected={async rf => {
                                                this.setState({ researchField: { ...rf, label: rf.value } });
                                            }}
                                            value={this.state.researchField}
                                            allowCreate={false}
                                            autoLoadOption={true}
                                            isDisabled={loading}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="ObservatoryDescription">Observatory description</Label>
                                        <Input
                                            onChange={this.handleChange}
                                            type="textarea"
                                            name="description"
                                            id="ObservatoryDescription"
                                            disabled={loading}
                                            placeholder="Observatory description"
                                        />
                                    </FormGroup>
                                    <Button
                                        color="primary"
                                        onClick={this.createNewObservatory}
                                        outline
                                        className="mt-4 mb-2"
                                        block
                                        disabled={loading}
                                    >
                                        {!loading ? 'Create Observatory' : <span>Loading</span>}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button
                                        color="link"
                                        className="p-0 mb-2 mt-2 clearfix"
                                        onClick={() => this.props.openAuthDialog({ action: 'signin' })}
                                    >
                                        <Icon className="mr-1" icon={faUser} /> Sign in to create an observatory
                                    </Button>
                                </>
                            )}
                        </Container>
                    </>
                )}
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
