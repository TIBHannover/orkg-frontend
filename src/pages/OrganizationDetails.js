import React, { Component } from 'react';
import { Container, Row, Col, NavLink, Button } from 'reactstrap';
import { getOrganization, getUsersByOrganizationId, getAllObservatoriesByOrganizationId } from 'network';
import InternalServerError from 'components/StaticPages/InternalServerError';
import { Link } from 'react-router-dom';
import NotFound from 'components/StaticPages/NotFound';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SameAsStatements from './SameAsStatements';
import styled from 'styled-components';
import Gravatar from 'react-gravatar';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';

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

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
    cursor: pointer;
`;

const ResearchProblemButton = styled.span`
    white-space: normal;
    text-align: left;
    user-select: text !important;
`;

class OrganizationDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            url: '',
            isLoading: false,
            isLoadingTotal: false,
            isLoadingObservatories: false,
            image: '',
            contributors: [],
            observatories: [],
            totalObservatories: 0,
            isLoadingContributors: false,
            createdBy: ''
        };
    }

    componentDidMount() {
        this.findOrg();
        this.loadObservatories();
        this.loadContributors();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.findOrg();
            this.loadObservatories();
            this.loadContributors();
        }
    };

    findOrg = () => {
        this.setState({ isLoading: true });
        getOrganization(this.props.match.params.id)
            .then(responseJson => {
                document.title = `${responseJson.name} - Organization - ORKG`;
                this.setState({
                    label: responseJson.name,
                    url: responseJson.url,
                    image: responseJson.logo,
                    isLoading: false,
                    createdBy: responseJson.created_by
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });
    };

    loadContributors = () => {
        this.setState({ isLoadingContributors: true });
        getUsersByOrganizationId(this.props.match.params.id)
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
        getAllObservatoriesByOrganizationId(this.props.match.params.id)
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

    render() {
        return (
            <>
                {this.state.isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        <div className="box clearfix pt-4 pb-4 pl-5 pr-5">
                            <div className="mb-2">
                                <span>
                                    <NavLink style={{ width: 500 }} href={this.state.url} target="_blank" rel="noopener noreferrer">
                                        <h4 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                            {this.state.label} <Icon size="sm" icon={faExternalLinkAlt} />
                                        </h4>
                                    </NavLink>

                                    <NavLink style={{ float: 'right', width: 500 }} href={this.state.url} target="_blank" rel="noopener noreferrer">
                                        <h4 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                            <img style={{ marginTop: -45 }} height="100" src={this.state.image} alt="" />{' '}
                                        </h4>
                                    </NavLink>
                                </span>
                            </div>
                            <div className="clearfix">
                                &nbsp; &nbsp;
                                {this.props.user && this.props.user.id === this.state.createdBy && (
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
                                )}
                                <SameAsStatements />
                            </div>
                        </div>
                        <br />
                        <Row>
                            <Col md={6} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div
                                    className="box rounded-lg p-3"
                                    style={{ minHeight: '500px', flexDirection: 'column', display: 'flex', flexGrow: '1' }}
                                >
                                    <h5 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>Observatories</h5>
                                    {!this.state.isLoadingObservatories ? (
                                        <div className="pb-2 mb-6">
                                            {this.state.observatories.length > 0 ? (
                                                <div style={{ paddingTop: 10 }}>
                                                    <ol className="list-group" style={{ paddingLeft: 15 }}>
                                                        {this.state.observatories.map((observatory, index) => {
                                                            return (
                                                                <li key={`c${index}`}>
                                                                    <Link to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}>
                                                                        <ResearchProblemButton className="btn btn-link p-0 border-0 align-baseline">
                                                                            {observatory.name}
                                                                        </ResearchProblemButton>
                                                                    </Link>
                                                                    <br />
                                                                </li>
                                                            );
                                                        })}
                                                    </ol>
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
                            <Col md={6} sm={12} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="box rounded-lg p-3" style={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}>
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
                                                                        <p style={{ marginLeft: '48px', marginTop: '-33px' }}>
                                                                            <Link
                                                                                onClick={this.toggleUserTooltip}
                                                                                to={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                                                            >
                                                                                {' '}
                                                                                {user.display_name}
                                                                            </Link>
                                                                            <br />
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
                    </Container>
                )}
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
    user: PropTypes.object
};

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(
    mapStateToProps,
    null
)(OrganizationDetails);
