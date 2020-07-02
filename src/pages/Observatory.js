import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getUsersByObservatoryId, getResourcesByObservatoryId, getObservatorybyId } from 'network';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import InternalServerError from 'components/StaticPages/InternalServerError';
import NotFound from 'components/StaticPages/NotFound';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
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

class Observatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            isLoading: false,
            isLoadingContributors: false,
            isLoadingResources: false,
            contributors: [],
            activeTab: 1,
            resourcesList: []
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
                    isLoading: false
                });
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
                            <div className="mb-6">
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
                                        {this.state.resourcesList.map((resource, index) => {
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
                {this.state.isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        <div className="box rounded clearfix pt-4 pb-4 pl-5 pr-5">
                            <div className="pb-2 mb-3">
                                <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    {this.state.label}
                                </h3>
                                <br />
                                <br />
                                <SidebarStyledBox>
                                    <ObservatoryDetailTabs className="clearfix d-flex">
                                        <div
                                            className={`h6 col-md-6 text-center tab ${this.state.activeTab === 1 ? 'active' : ''}`}
                                            onClick={() => this.barToggle(1)}
                                        >
                                            Contributors
                                        </div>
                                        <div
                                            className={`h6 col-md-6 text-center tab ${this.state.activeTab === 2 ? 'active' : ''}`}
                                            onClick={() => this.barToggle(2)}
                                        >
                                            Resources
                                        </div>
                                    </ObservatoryDetailTabs>
                                    <TransitionGroup exit={false}>{currentTabContent}</TransitionGroup>
                                </SidebarStyledBox>
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
