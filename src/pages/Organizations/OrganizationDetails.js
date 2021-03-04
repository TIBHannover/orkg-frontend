import { Component } from 'react';
import { Container, Row, Col, NavLink, Button, Card, CardTitle } from 'reactstrap';
import { getUsersByOrganizationId, getAllObservatoriesByOrganizationId, getOrganization } from 'services/backend/organizations';
import InternalServerError from 'pages/InternalServerError';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import NotFound from 'pages/NotFound';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Dotdotdot from 'react-dotdotdot';
import ROUTES from 'constants/routes';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import EditOrganization from 'components/Organization/EditOrganization';
import { reverse } from 'named-urls';

const StyledOrganizationHeader = styled.div`
    .logoContainer {
        position: relative;
        display: block;
        &::before {
            // for aspect ratio
            content: '';
            display: block;
            padding-bottom: 130px;
        }
        img {
            position: absolute;
            max-width: 100%;
            max-height: 130px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:active,
        &:focus {
            outline: 0;
            border: none;
            -moz-outline-style: none;
        }
    }
`;

class OrganizationDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            url: '',
            isLoading: false,
            isLoadingObservatories: false,
            logo: '',
            contributors: [],
            observatories: [],
            isLoadingContributors: false,
            createdBy: '',
            showEditDialog: false,
            organizationId: ''
        };
    }

    async componentDidMount() {
        await this.findOrg();
        this.loadObservatories();
        this.loadContributors();
    }

    componentDidUpdate = async prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            await this.findOrg();
            this.loadObservatories();
            this.loadContributors();
        }
    };

    findOrg = async () => {
        this.setState({ isLoading: true });
        await getOrganization(this.props.match.params.id)
            .then(responseJson => {
                document.title = `${responseJson.name} - Organization - ORKG`;
                this.setState({
                    label: responseJson.name,
                    url: responseJson.homepage,
                    logo: responseJson.logo,
                    isLoading: false,
                    createdBy: responseJson.created_by,
                    organizationId: responseJson.id
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });
    };

    loadContributors = () => {
        this.setState({ isLoadingContributors: true });
        getUsersByOrganizationId(this.state.organizationId)
            .then(contributors => {
                this.setState({
                    contributors: contributors,
                    isLoadingContributors: false
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoadingContributors: false });
            });
    };

    loadObservatories = () => {
        this.setState({ isLoadingObservatories: true });
        getAllObservatoriesByOrganizationId(this.state.organizationId)
            .then(observatories => {
                if (observatories.length > 0) {
                    this.setState({
                        observatories: observatories,
                        isLoadingObservatories: false
                    });
                } else {
                    this.setState({
                        isLoadingObservatories: false
                    });
                }
            })
            .catch(error => {
                this.setState({
                    isLoadingObservatories: false
                });
            });
    };

    updateOrganizationMetadata = (label, url, logo) => {
        this.setState({ label: label, url: url, logo: logo });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    render() {
        return (
            <>
                {this.state.isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <>
                        <Container className="d-flex align-items-center">
                            <h3 className="h4 my-4 flex-grow-1">Organization</h3>
                        </Container>
                        <Container className="box rounded clearfix py-4 px-5">
                            <StyledOrganizationHeader className="mb-2">
                                <Row>
                                    <Col md={{ size: 8, order: 1 }} sm={{ size: 12, order: 2 }} xs={{ size: 12, order: 2 }}>
                                        <NavLink className="p-0" href={this.state.url} target="_blank" rel="noopener noreferrer">
                                            <h4>
                                                {this.state.label} {this.state.url && <Icon size="sm" icon={faExternalLinkAlt} />}
                                            </h4>
                                        </NavLink>
                                        {!!this.props.user && (this.props.user.id === this.state.createdBy || this.props.user.isCurationAllowed) && (
                                            <div>
                                                <Button
                                                    outline
                                                    size="sm"
                                                    color="primary"
                                                    className="mt-4"
                                                    tag={Link}
                                                    to={reverse(ROUTES.ADD_OBSERVATORY, { id: this.props.match.params.id })}
                                                >
                                                    Create new observatory
                                                </Button>

                                                <Button
                                                    color="darkblue"
                                                    size="sm"
                                                    className="mt-4 ml-4"
                                                    onClick={() => this.toggle('showEditDialog')}
                                                >
                                                    <Icon icon={faPen} /> Edit
                                                </Button>
                                            </div>
                                        )}
                                    </Col>
                                    {this.state.logo && (
                                        <Col md={{ size: 4, order: 2 }} sm={{ size: 12, order: 1 }} xs={{ size: 12, order: 1 }}>
                                            <NavLink className="p-0" href={this.state.url} target="_blank" rel="noopener noreferrer">
                                                <div className="logoContainer">
                                                    <img className="mx-auto" src={this.state.logo} alt={`${this.state.label} logo`} />
                                                </div>
                                            </NavLink>
                                        </Col>
                                    )}
                                </Row>
                            </StyledOrganizationHeader>
                        </Container>
                        <Container>
                            <Row className="mt-4">
                                <Col md={6} sm={12} style={{ minHeight: '500px' }} className="d-flex px-0 pr-4">
                                    <div className="p-4 box rounded-lg flex-grow-1">
                                        <h2 className="h5">Observatories</h2>
                                        {!this.state.isLoadingObservatories ? (
                                            <div className="mb-4 mt-4">
                                                {this.state.observatories.length > 0 ? (
                                                    <div>
                                                        {this.state.observatories.map((observatory, index) => {
                                                            return (
                                                                <Card body key={`c${index}`} className="mt-1 border-0 p-0">
                                                                    <CardTitle>
                                                                        <Link to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}>
                                                                            {observatory.name}
                                                                        </Link>
                                                                    </CardTitle>
                                                                    <Dotdotdot clamp={3}>
                                                                        <small className="text-muted">{observatory.description}</small>
                                                                    </Dotdotdot>
                                                                    <hr style={{ width: '90%', margin: '10px auto' }} />
                                                                </Card>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
                                                        <h5>No Observatories</h5>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-4">
                                                <h5>Loading observatories ...</h5>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6} sm={12} className="d-flex px-0">
                                    <div className="box rounded-lg p-4 flex-grow-1">
                                        <h2 className="h5">Contributors</h2>
                                        {!this.state.isLoadingContributors ? (
                                            <div className="mb-4 mt-4">
                                                {this.state.contributors.length > 0 ? (
                                                    <div>
                                                        {this.state.contributors.map((user, index) => {
                                                            return (
                                                                <div>
                                                                    <ContributorCard contributor={user} />

                                                                    <hr style={{ width: '90%', margin: '10px auto' }} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
                                                        <h5>No Contributors</h5>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-4">
                                                <h5>Loading Contributors ...</h5>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </>
                )}
                <EditOrganization
                    showDialog={this.state.showEditDialog}
                    toggle={() => this.toggle('showEditDialog')}
                    label={this.state.label}
                    id={this.state.organizationId}
                    url={this.state.url}
                    previewSrc={this.state.logo}
                    updateOrganizationMetadata={this.updateOrganizationMetadata}
                />
            </>
        );
    }
}

OrganizationDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(
    mapStateToProps,
    null
)(OrganizationDetails);
