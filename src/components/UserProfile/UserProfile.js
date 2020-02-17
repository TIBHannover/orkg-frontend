import { Container, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gravatar from 'react-gravatar';
import { getUserInformationById } from 'network';
import PaperCard from '../PaperCard/PaperCard';
import { getStatementsByObject, getStatementsBySubject, getStatementsBySubjects, getResourcesByClass } from '../../network';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import NotFound from '../StaticPages/NotFound';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
`;

const StyledActivity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};
    .time {
        color: rgba(100, 100, 100, 0.57);
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 15px;
    }
    .time::before {
        width: 1rem;
        height: 1rem;
        margin-left: -1.6rem;
        margin-right: 0.5rem;
        border-radius: 15px;
        content: '';
        background-color: #c2c6d6;
        display: inline-block;
    }
    a {
        color: ${props => props.theme.ORKGPrimaryColor};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;

class UserProfile extends Component {
    state = {
        displayName: '',
        notFound: false,
        isNextPageLoading: false,
        hasNextPage: false,
        page: 1,
        papers: [],
        isLastPageReached: false
    };

    componentDidMount() {
        this.getUserInformation();
        this.loadMorePapers();
    }

    pageSize = 5;

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });

        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_PAPER,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'id',
            desc: true,
            creator: this.props.match.params.userId
        }).then(result => {
            // Papers
            if (result.length > 0) {
                // Fetch the data of each paper
                console.log(result);
                getStatementsBySubjects({
                    ids: result.map(p => p.id)
                })
                    .then(papersStatements => {
                        const papers = papersStatements.map(paperStatements => {
                            const paperSubject = find(result, { id: paperStatements.id });
                            return getPaperData(
                                paperStatements.id,
                                paperStatements && paperSubject.label ? paperSubject.label : 'No Title',
                                paperStatements.statements
                            );
                        });
                        this.setState({
                            papers: [...this.state.papers, ...papers],
                            isNextPageLoading: false,
                            hasNextPage: papers.length < this.pageSize || papers.length === 0 ? false : true,
                            page: this.state.page + 1
                        });
                    })
                    .catch(error => {
                        this.setState({
                            isNextPageLoading: false,
                            hasNextPage: false,
                            isLastPageReached: true
                        });
                        console.log(error);
                    });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    getUserInformation = async () => {
        this.setState({
            notFound: false
        });

        try {
            const userData = await getUserInformationById(this.props.match.params.userId);

            this.setState({
                displayName: userData.display_name,
                email: userData.email
            });
        } catch (e) {
            this.setState({
                notFound: true
            });
        }
    };

    render() {
        if (this.state.notFound) {
            return <NotFound />;
        }

        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Profile of {this.state.displayName}</h1>
                </Container>
                {/*<Container className="box pt-4 pb-3 pl-5 pr-5">
                    <Row>
                        <div className="col-1 text-center">
                            <StyledGravatar className="rounded-circle" email="example@example.com" size={76} id="TooltipExample" />{' '}
                            TODO: Replace with hash from email (should be returned by the backend) 
                        </div>
                        <div className="col-11 pl-4">
                            <h2 className="h5">{this.state.displayName}</h2>
                            TODO: support more information for users, like organization and short bio
                            <p>
                            <b className={'d-block'}>Organization</b>
                            L3S Research Center
                        </p>

                        <p>
                            <b className={'d-block'}>Bio </b>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                            aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        </div>
                    </Row>
                </Container>*/}
                <Container className="box mt-4 pt-4 pb-3 pl-5 pr-5">
                    <h5 className="mb-4">Added papers</h5>

                    {this.state.papers.length > 0 && (
                        <div>
                            {this.state.papers.map(resource => {
                                return <PaperCard paper={{ title: resource.label, ...resource }} key={`pc${resource.id}`} />;
                            })}
                            {!this.state.isNextPageLoading && this.state.hasNextPage && (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    className="list-group-item list-group-item-action text-center"
                                    onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                                >
                                    View more papers
                                </div>
                            )}
                        </div>
                    )}

                    {this.state.papers.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mb-2">This user hasn't added any papers to ORKG yet</div>
                    )}
                </Container>
                {/*
                TODO: support for activity feed
                <Container className="box mt-4 pt-4 pb-3 pl-5 pr-5">
                <h5 className="mb-4">Activity feed</h5>
                <StyledActivity className="pl-3 pb-3">
                    <div className={'time'}>16 JULY 2019</div>
                    <div>
                        John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                    </div>
                </StyledActivity>
                <StyledActivity className="pl-3 pb-3">
                    <div className={'time'}>10 JULY 2019</div>
                    <div>
                        John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                    </div>
                    <div>
                        John Doe commented on predicate <Link to={'/'}>Has Problem</Link>
                    </div>
                </StyledActivity>
                <StyledActivity className="pl-3 pb-3">
                    <div className={'time'}>5 JULY 2019</div>
                    <div>John Doe joined ORKG, welcome!</div>
                </StyledActivity>
                </Container>*/}
            </>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

UserProfile.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserProfile);
