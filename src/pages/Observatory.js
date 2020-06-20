import React, { Component } from 'react';
import { Container, ButtonGroup } from 'reactstrap';
import { Alert, Col, Form, FormGroup, Row, Button } from 'reactstrap';
import { getUsersByObservatoryId, getOrganization, getResourcesByObservatoryId, getObservatorybyId } from 'network';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import InternalServerError from 'components/StaticPages/InternalServerError';
import NotFound from 'components/StaticPages/NotFound';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import VisibilitySensor from 'react-visibility-sensor';
import Gravatar from 'react-gravatar';
import { Link } from 'react-router-dom';
import PaperMenuBar from 'components/ViewPaper/PaperHeaderBar/PaperMenuBar';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    overflow: hidden;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

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

const ObservatoryDetailTabs = styled.div`
    .tab {
        margin-bottom: 0;
        padding: 15px;
        color: #bebbac;
        cursor: pointer;
        border-bottom: 2px solid #fff;
        &.active,
        &:hover {
            border-bottom: 2px solid #e86161;
            color: #646464;
        }
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
                //this.loadOrganizations(observatory.organizations)
                //console.log(observatory.organizations);
                document.title = `${observatory.name} - Details`;
                this.setState({
                    label: observatory.name,
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
                console.log(resources);
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
        //console.log(organizationsData);
        //var organizationsDetails = [];
        this.setState({ isLoadingOrganizations: true });
        let organizationsDetails = [];
        for (var i = 0; i < organizationsData.length; i++) {
            //console.log(organizationsData[i].id);
            //organizations[i] =
            getOrganization(organizationsData[i].id).then(organization => {
                this.setState({
                    organizationsList: [...this.state.organizationsList, organization]
                });
                //organizationsDetails.push(organization);
            });
        }

        //console.log([organizationsDetails]);

        this.setState({
            //organizationsList: organizationsDetails,
            isLoadingOrganizations: false
        });
        console.log(this.state.organizationsList);
        //console.log(organizations);
        //})
        //.catch(error => {
        //  this.setState({ error: error, isLoadingOrganizations: false });
        //});
    };

    barToggle = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({ activeTab: tab });
        }
    };

    render = () => {
        let currentTabContent;

        switch (this.state.activeTab) {
            case 1:
            default:
                currentTabContent = (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        {!this.state.isLoadingContributors ? (
                            <div className={'mb-6'}>
                                <div className="pb-2 mb-6">
                                    {this.state.contributors.length > 0 ? (
                                        <div style={{ paddingTop: 10 }}>
                                            {this.state.contributors.map((user, index) => {
                                                return (
                                                    <ShortRecord
                                                        key={`user${index}`}
                                                        header={user.display_name}
                                                        href={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <h5>No Contributors</h5>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <h5>Loading Contributors ...</h5>
                            </div>
                        )}
                    </AnimationContainer>
                );
                break;
            case 2:
                currentTabContent = (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        {!this.state.isLoadingResources ? (
                            <div className="pb-2 mb-6">
                                {this.state.resourcesList.length > 0 ? (
                                    <div style={{ paddingTop: 10 }}>
                                        {this.state.resourcesList
                                            .filter(resource => resource.classes.includes('Paper'))
                                            .map((resource, index) => {
                                                {
                                                    console.log(resource.classes);
                                                }
                                                {
                                                    /* {this.state.resourcesList.filter().map((resource, index) => { */
                                                }
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
                                        <h5>No Resources</h5>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-4">
                                <h5>Loading resources ...</h5>
                            </div>
                        )}
                    </AnimationContainer>
                );
                break;
        }

        return (
            <>
                {console.log(this.state.organizationsList.length)}
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        <VisibilitySensor onChange={this.handleShowHeaderBar}>
                            <Container className="d-flex align-items-center">
                                <h1 className="h4 mt-4 mb-4 flex-grow-1">Observatory</h1>
                            </Container>
                        </VisibilitySensor>

                        <div className={'box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <h3>{this.state.label}</h3>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
                            dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen
                            book.
                        </div>
                        <br />

                        {/* <Container> */}
                        <Row>
                            <Col md={8} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div
                                    className="box rounded-lg p-3"
                                    style={{ height: '500px', flexDirection: 'column', display: 'flex', flexGrow: '1' }}
                                >
                                    <h5 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        Research Problems
                                    </h5>
                                    {!this.state.isLoadingResources ? (
                                        <div className="pb-2 mb-6">
                                            {this.state.resourcesList.length > 0 ? (
                                                <div style={{ paddingTop: 10 }}>
                                                    {/* {this.state.resourcesList.map((resource, index) => { */}
                                                    {this.state.resourcesList
                                                        .filter(resource => resource.classes.includes(process.env.REACT_APP_CLASSES_PROBLEM))
                                                        .map((resource, index) => {
                                                            return (
                                                                // <ShortRecord
                                                                // key={`resource${index}`}
                                                                // header={resource.label}
                                                                // href={
                                                                // resource.classes.includes(process.env.REACT_APP_CLASSES_PAPER)
                                                                // ? reverse(ROUTES.VIEW_PAPER, { resourceId: resource.id })
                                                                // : reverse(ROUTES.RESOURCE, { id: resource.id })
                                                                // }
                                                                // />
                                                                <span key={index}>
                                                                    {index + 1}
                                                                    {'. '}
                                                                    <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: resource.id })}>
                                                                        <ResearchProblemButton className="btn btn-link p-0 border-0 align-baseline">
                                                                            {resource.label}
                                                                        </ResearchProblemButton>
                                                                    </Link>
                                                                    <br />
                                                                </span>
                                                            );
                                                        })}
                                                </div>
                                            ) : (
                                                <div className="mt-4">
                                                    <h5>No Resources</h5>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <h5>Loading resources ...</h5>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={4} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div
                                    className="box rounded-lg p-3"
                                    style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}
                                >
                                    <h5 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        Organizations
                                    </h5>
                                    {!this.state.isLoadingOrganizations ? (
                                        <StyledScrollBar className="mb-6">
                                            {this.state.organizationsList.length > 0 ? (
                                                <div>
                                                    {/* {this.state.resourcesList.map((resource, index) => { */}
                                                    {this.state.organizationsList.map((organization, index) => {
                                                        //{
                                                        //console.log(organization, index);
                                                        //s}
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
                                                                    <br />
                                                                    {' '}
                                                                    {/* {organization.name} */}
                                                                </Link>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="mt-4">
                                                    <h5>No Resources</h5>
                                                </div>
                                            )}
                                        </StyledScrollBar>
                                    ) : (
                                        <div className="mt-4">
                                            <h5>Loading resources ...</h5>
                                        </div>
                                    )}
                                </div>
                                <div className="box rounded-lg mt-4 p-3" style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}>
                                    <h2 className="h5">Contributors</h2>
                                    {/* </div> */}

                                    {!this.state.isLoadingContributors ? (
                                        <div className={'mb-6'}>
                                            <StyledScrollBar className="pb-2 mb-6">
                                                {this.state.contributors.length > 0 ? (
                                                    <div className={'scrollBarDiv'}>
                                                        {this.state.contributors.map((user, index) => {
                                                            return (
                                                                <div>
                                                                    <div>
                                                                        <StyledGravatar
                                                                            className="rounded-circle"
                                                                            style={{ border: '3px solid #fff' }}
                                                                            email={user.email}
                                                                            size={45}
                                                                            id="TooltipExample"
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
                                                                                    return <div style={{ color: 'gray' }}>{o.name}</div>;
                                                                                })}
                                                                        </p>
                                                                    </div>

                                                                    {/* <Row> */}
                                                                    {/* <div className="col-3"> */}

                                                                    <hr style={{ width: '275px', marginBottom: '10px', marginTop: '10px' }} />

                                                                    {/* </div> */}
                                                                    {/* </Row> */}
                                                                </div>
                                                                // <ShortRecord
                                                                // key={`user${index}`}
                                                                // header={user.display_name}
                                                                // href={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                                                // />
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
                            {/* <div className={'box clearfix pt-4 pb-4 pl-5 pr-5 col-sm-12 col-md-7'}> */}
                            {/* <div> */}
                            {/* 234 */}
                            {/* </div> */}
                            {/* Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. */}
                            {/* </div> */}

                            {/* <div className={'box clearfix pt-4 pb-4 pl-5 pr-5 col-sm-12 col-md-5'}> */}
                            {/* Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. */}
                            {/* </div> */}
                        </Row>
                        {/* </Container> */}

                        <VisibilitySensor onChange={this.handleShowHeaderBar}>
                            <Container className="d-flex align-items-center">
                                <h1 className="h4 mt-4 mb-4 flex-grow-1">Content</h1>
                            </Container>
                        </VisibilitySensor>

                        <div className={'box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className="pb-2 mb-3">
                                <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    Comparisons
                                </h3>
                                {!this.state.isLoadingComparisons ? (
                                    <div className="pb-2 mb-6">
                                        {this.state.commparisonsList.length > 0 ? (
                                            <div style={{ paddingTop: 10 }}>
                                                {this.state.resourcesList.map((resource, index) => {
                                                    return <ShortRecord />;
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
                                {/* <div className="pb-2 mb-3"> */}
                                {/* <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}> */}
                                {/* {this.state.label} */}
                                {/* </h3> */}
                                {/* <br /> */}
                                {/* <br /> */}

                                {/* <SidebarStyledBox> */}
                                {/* <ObservatoryDetailTabs className="clearfix d-flex"> */}
                                {/* <div */}
                                {/* className={`h6 col-md-6 text-center tab ${this.state.activeTab === 1 ? 'active' : ''}`} */}
                                {/* onClick={() => this.barToggle(1)} */}
                                {/* > */}
                                {/* Contributors */}
                                {/* </div> */}
                                {/* <div */}
                                {/* className={`h6 col-md-6 text-center tab ${this.state.activeTab === 2 ? 'active' : ''}`} */}
                                {/* onClick={() => this.barToggle(2)} */}
                                {/* > */}
                                {/* Resources */}
                                {/* </div> */}
                                {/* </ObservatoryDetailTabs> */}
                                {/* <TransitionGroup exit={false}>{currentTabContent}</TransitionGroup> */}
                                {/* </SidebarStyledBox> */}
                                {/* </div> */}
                            </div>
                        </div>

                        <br />
                        <div className={'box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className="pb-2 mb-3">
                                <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    Papers
                                </h3>
                                {/* </div> */}
                                {!this.state.isLoadingResources ? (
                                    <div className="pb-2 mb-6">
                                        {this.state.resourcesList.length > 0 ? (
                                            <div style={{ paddingTop: 10 }}>
                                                {/* {this.state.resourcesList.map((resource, index) => { */}
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
                                                <h5>No Resources</h5>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <h5>Loading resources ...</h5>
                                    </div>
                                )}
                                {/* <div className="pb-2 mb-3"> */}
                                {/* <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}> */}
                                {/* {this.state.label} */}
                                {/* </h3> */}
                                {/* <br /> */}
                                {/* <br /> */}

                                {/* <SidebarStyledBox> */}
                                {/* <ObservatoryDetailTabs className="clearfix d-flex"> */}
                                {/* <div */}
                                {/* className={`h6 col-md-6 text-center tab ${this.state.activeTab === 1 ? 'active' : ''}`} */}
                                {/* onClick={() => this.barToggle(1)} */}
                                {/* > */}
                                {/* Contributors */}
                                {/* </div> */}
                                {/* <div */}
                                {/* className={`h6 col-md-6 text-center tab ${this.state.activeTab === 2 ? 'active' : ''}`} */}
                                {/* onClick={() => this.barToggle(2)} */}
                                {/* > */}
                                {/* Resources */}
                                {/* </div> */}
                                {/* </ObservatoryDetailTabs> */}
                                {/* <TransitionGroup exit={false}>{currentTabContent}</TransitionGroup> */}
                                {/* </SidebarStyledBox> */}
                                {/* </div> */}
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
