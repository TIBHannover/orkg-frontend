import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import { getUsersByObservatoryId, getOrganization, getResourcesByObservatoryId, getObservatorybyId } from 'network';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import InternalServerError from 'components/StaticPages/InternalServerError';
import NotFound from 'components/StaticPages/NotFound';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Gravatar from 'react-gravatar';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
    cursor: pointer;
`;

const StyledScrollBar = styled.div`
    &::-webkit-scrollbar,
    &::-webkit-scrollbar-thumb {
        width: 24px;
        border-radius: 13px;
        background-clip: padding-box;
        border: 10px solid transparent;
        color: lightgray;
    }

    &::-webkit-scrollbar-thumb {
        box-shadow: inset 0 0 0 10px;
    }

    height: 225px;
    overflow: auto;
    
    }
`;

const ResearchProblemButton = styled.span`
    white-space: normal;
    text-align: left;
    user-select: text !important;
`;

class Observatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            description: '',
            isLoading: false,
            isLoadingContributors: false,
            isLoadingResources: false,
            isLoadingOrganizations: false,
            isLoadingComparisons: false,
            contributors: [],
            activeTab: 1,
            resourcesList: [],
            organizationsList: [],
            commparisonsList: []
        };
    }

    componentDidMount() {
        this.loadObservatory();
        this.loadContributors();
        this.loadResources();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.loadObservatory();
            this.loadContributors();
            this.loadResources();
        }
    };

    loadObservatory = () => {
        this.setState({ isLoading: true });
        getObservatorybyId(this.props.match.params.id)
            .then(observatory => {
                document.title = `${observatory.name} - Details`;
                this.setState({
                    label: observatory.name,
                    description: observatory.description,
                    isLoading: false
                });
                this.loadOrganizations(observatory.organizations);
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });
    };

    loadResources = () => {
        this.setState({ isLoadingResources: true });
        getResourcesByObservatoryId(this.props.match.params.id)
            .then(resources => {
                this.setState({
                    resourcesList: resources,
                    isLoadingResources: false
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoadingResources: false });
            });
    };

    loadContributors = () => {
        this.setState({ isLoadingContributors: true });
        getUsersByObservatoryId(this.props.match.params.id)
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

    loadOrganizations = organizationsData => {
        this.setState({ isLoadingOrganizations: true });
        for (let i = 0; i < organizationsData.length; i++) {
            getOrganization(organizationsData[i].id).then(organization => {
                this.setState({
                    organizationsList: [...this.state.organizationsList, organization]
                });
            });
        }

        this.setState({
            isLoadingOrganizations: false
        });
    };

    barToggle = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({ activeTab: tab });
        }
    };

    render = () => {
        return (
            <>
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        <Container className="d-flex align-items-center">
                            <h3 className="h4 mb-4 flex-grow-1">Observatory</h3>
                        </Container>

                        <div className="box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5">
                            <h3>{this.state.label}</h3>
                            {this.state.description}
                        </div>
                        <br />

                        <Row>
                            <Col md={8} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div
                                    className="box rounded-lg p-3"
                                    style={{ minHeight: '500px', flexDirection: 'column', display: 'flex', flexGrow: '1' }}
                                >
                                    <h5 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>Research Problems</h5>
                                    {!this.state.isLoadingResources ? (
                                        <div className="pb-2 mb-6">
                                            {this.state.resourcesList.length > 0 ? (
                                                <div style={{ paddingTop: 10 }}>
                                                    <ul className="list-group" style={{ paddingLeft: 15 }}>
                                                        {this.state.resourcesList
                                                            .filter(resource => resource.classes.includes(process.env.REACT_APP_CLASSES_PROBLEM))
                                                            .map((resource, index) => {
                                                                return (
                                                                    <li>
                                                                        <Link
                                                                            to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: resource.id })}
                                                                        >
                                                                            <ResearchProblemButton className="btn btn-link p-0 border-0 align-baseline">
                                                                                {resource.label}
                                                                            </ResearchProblemButton>
                                                                        </Link>
                                                                        <br />
                                                                    </li>
                                                                );
                                                            })}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <div className="mt-4">
                                                    <h5>No Research Problems</h5>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <h5>Loading research problems ...</h5>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={4} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="box rounded-lg p-3" style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}>
                                    <h5 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>Organizations</h5>
                                    {!this.state.isLoadingOrganizations ? (
                                        <StyledScrollBar className="mb-6">
                                            {this.state.organizationsList.length > 0 ? (
                                                <div>
                                                    {this.state.organizationsList.map((organization, index) => {
                                                        return (
                                                            <div
                                                                className="mb-3"
                                                                style={{
                                                                    border: 'solid lightgray thin',
                                                                    textAlign: 'center',
                                                                    verticalAlign: 'middle',
                                                                    paddingBottom: '11px'
                                                                }}
                                                            >
                                                                <Link to={reverse(ROUTES.ORGANIZATION, { id: organization.id })}>
                                                                    <img style={{ marginTop: 12 }} height="70" src={organization.logo} alt="" />
                                                                    <br />{' '}
                                                                </Link>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="mt-4">
                                                    <h5>No Organizations</h5>
                                                </div>
                                            )}
                                        </StyledScrollBar>
                                    ) : (
                                        <div className="mt-4">
                                            <h5>Loading organizations ...</h5>
                                        </div>
                                    )}
                                </div>
                                <div className="box rounded-lg mt-4 p-3" style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}>
                                    <h2 className="h5">Contributors</h2>
                                    {!this.state.isLoadingContributors ? (
                                        <div className="mb-6">
                                            <StyledScrollBar className="pb-2 mb-6">
                                                {this.state.contributors.length > 0 ? (
                                                    <div className="scrollBarDiv">
                                                        {this.state.contributors.map((user, index) => {
                                                            return (
                                                                <div>
                                                                    <div>
                                                                        <StyledGravatar
                                                                            className="rounded-circle"
                                                                            style={{ border: '3px solid #fff' }}
                                                                            email={user.email}
                                                                            size={45}
                                                                        />
                                                                        <p style={{ marginLeft: '48px', marginTop: '-47px' }}>
                                                                            <Link
                                                                                onClick={this.toggleUserTooltip}
                                                                                to={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                                                            >
                                                                                {' '}
                                                                                {user.display_name}
                                                                            </Link>
                                                                            <br />
                                                                            {this.state.organizationsList
                                                                                .filter(o => o.id.includes(user.organization_id))
                                                                                .map((o, index) => {
                                                                                    return <span style={{ color: 'gray' }}>{o.name}</span>;
                                                                                })}
                                                                        </p>
                                                                    </div>

                                                                    <hr style={{ width: '275px', marginBottom: '10px', marginTop: '10px' }} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
                                                        <h5>No Contributors</h5>
                                                    </div>
                                                )}
                                            </StyledScrollBar>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <h5>Loading Contributors ...</h5>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <Container className="d-flex align-items-center">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">Content</h1>
                        </Container>

                        <div className="box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5">
                            <div className="pb-2 mb-3">
                                <h3 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>Comparisons</h3>
                                {!this.state.isLoadingResources ? (
                                    <div className="pb-2 mb-6">
                                        {this.state.resourcesList.length > 0 ? (
                                            <div style={{ paddingTop: 10 }}>
                                                {this.state.resourcesList
                                                    .filter(resource => resource.classes.includes('Comparison'))
                                                    .map((resource, index) => {
                                                        return (
                                                            <ShortRecord
                                                                key={`resource${index}`}
                                                                header={resource.label}
                                                                href={
                                                                    resource.classes.includes(process.env.REACT_APP_CLASSES_COMPARISON)
                                                                        ? reverse(ROUTES.COMPARISON, { comparisonId: resource.id })
                                                                        : reverse(ROUTES.RESOURCE, { id: resource.id })
                                                                }
                                                            />
                                                        );
                                                    })}
                                            </div>
                                        ) : (
                                            <div className="text-center mt-4 mb-4">No Comparisons</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <h5>Loading comparisons ...</h5>
                                    </div>
                                )}
                            </div>
                        </div>

                        <br />
                        <div className="box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5">
                            <div className="pb-2 mb-3">
                                <h3 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>Papers</h3>
                                {!this.state.isLoadingResources ? (
                                    <div className="pb-2 mb-6">
                                        {this.state.resourcesList.length > 0 ? (
                                            <div style={{ paddingTop: 10 }}>
                                                {this.state.resourcesList
                                                    .filter(resource => resource.classes.includes('Paper'))
                                                    .map((resource, index) => {
                                                        return (
                                                            <ShortRecord
                                                                key={`resource${index}`}
                                                                header={resource.label}
                                                                href={
                                                                    resource.classes.includes(process.env.REACT_APP_CLASSES_PAPER)
                                                                        ? reverse(ROUTES.VIEW_PAPER, { resourceId: resource.id })
                                                                        : reverse(ROUTES.RESOURCE, { id: resource.id })
                                                                }
                                                            />
                                                        );
                                                    })}
                                            </div>
                                        ) : (
                                            <div className="mt-4">
                                                <h5>No Papers</h5>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <h5>Loading papers ...</h5>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Container>
                )}
            </>
        );
    };
}

Observatory.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default Observatory;
