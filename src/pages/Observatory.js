import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getUsersByObservatoryId, getResourcesByObservatoryId, getObservatorybyId } from '../network';
import EditableHeader from '../components/EditableHeader';
import InternalServerError from '../components/StaticPages/InternalServerError';
import NotFound from '../components/StaticPages/NotFound';
import PropTypes from 'prop-types';
import SameAsStatements from './SameAsStatements';
import ROUTES from '../constants/routes';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Link } from 'react-router-dom';

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
        -webkit-transition: border 500ms ease-out;
        -moz-transition: border 500ms ease-out;
        -o-transition: border 500ms ease-out;
        transition: border 500ms ease-out;
        &.active,
        &:hover {
            border-bottom: 2px solid #e86161;
            color: #646464;
        }
    }
`;

const StyledShortRecord = styled.div`
    border: 1px solid #c8ccd1;
    margin-bottom: 2em;
    position: relative;
    width: 100%;
    .shortRecord-header {
        background-color: #eaecf0;
        position: relative;
        width: 100%;
    }
    .shortRecord-content {
        width: 100%;
        overflow-wrap: break-word;
    }
`;

class Observatory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            isLoading: false,
            observatoryId: '',
            users: [],
            activeTab: 1,
            resourcesList: []
        };
    }

    componentDidMount() {
        this.getContributors();
        this.getResources();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.getContributors();
            this.getResources();
        }
    };

    getResources = () => {
        this.setState({ isLoading: true });
        getResourcesByObservatoryId(this.props.match.params.id)
            .then(resources => {
                this.setState({
                    resourcesList: resources
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });
    };

    getContributors = () => {
        this.setState({ isLoading: true });
        getUsersByObservatoryId(this.props.match.params.id)
            .then(users => {
                this.setState({
                    users: users
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });

        getObservatorybyId(this.props.match.params.id)
            .then(observatory => {
                document.title = `${observatory.name} - Details`;
                this.setState({
                    label: observatory.name,
                    isLoading: false,
                    observatoryId: this.props.match.params.id
                    
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });
    };

    handleHeaderChange = event => {
        this.setState({ label: event.value });
    };

    barToggle = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({ activeTab: tab });
        }
    };

    render = () => {
        const id = this.props.match.params.id;
        let rightSidebar;

        switch (this.state.activeTab) {
            case 1:
            default:
                rightSidebar = (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div>
                            <div className={'mb-6'}>
                                {!this.state.editMode ? (
                                    <div className="pb-2 mb-6">
                                        <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                            {this.state.users.length > 0 ? (
                                                <div style={{ paddingLeft: 20, paddingTop: 10 }}>
                                                    {this.state.users.map(user => {
                                                        return (
                                                            <StyledShortRecord>
                                                                <div className="shortRecord-header">
                                                                    {' '}
                                                                    <p style={{ fontSize: 14, marginBottom: -12 }}>
                                                                        <p to={user.id}>{user.display_name}</p>
                                                                    </p>
                                                                </div>
                                                            </StyledShortRecord>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div style={{ paddingLeft: '18%' }} className="mt-4">
                                                    <h5>No Contributors</h5>
                                                </div>
                                            )}
                                        </h3>
                                    </div>
                                ) : (
                                    <EditableHeader id={id} value={this.state.label} onChange={this.handleHeaderChange} />
                                )}
                            </div>
                        </div>
                    </AnimationContainer>
                );
                break;
            case 2:
                rightSidebar = (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <div>
                            <div className={'mb-6'}>
                                {!this.state.editMode ? (
                                    <div className="pb-2 mb-6">
                                        <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                            {this.state.resourcesList.length > 0 ? (
                                                <div style={{ paddingLeft: 20, paddingTop: 10 }}>
                                                    {this.state.resourcesList.map(resources => {
                                                        return (
                                                            <StyledShortRecord>
                                                                <div className="shortRecord-header">
                                                                    <p style={{ fontSize: 14, marginBottom: 4 }}>
                                                                        <Link to={reverse(ROUTES.RESOURCE, { id: resources.id })}>
                                                                            {resources.label}
                                                                        </Link>
                                                                    </p>
                                                                </div>
                                                            </StyledShortRecord>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div style={{ paddingLeft: '70%' }} className="mt-4">
                                                    <h5>No Resources</h5>
                                                </div>
                                            )}
                                        </h3>
                                    </div>
                                ) : (
                                    <EditableHeader id={id} value={this.state.label} onChange={this.handleHeaderChange} />
                                )}
                            </div>
                        </div>
                    </AnimationContainer>
                );
                break;
        }

        return (
            <>
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        <div className={'box clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className={'mb-2'}>
                                <div className="pb-2 mb-3">
                                    <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {this.state.label}
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
                                            <TransitionGroup exit={false}>{rightSidebar}</TransitionGroup>
                                        </SidebarStyledBox>
                                    </h3>
                                </div>
                            </div>
                            <div className={'clearfix'}>
                                <SameAsStatements />
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
