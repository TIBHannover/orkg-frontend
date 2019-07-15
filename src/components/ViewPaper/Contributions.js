import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { selectContribution } from '../../actions/viewPaper';
import { StyledContribution, StyledContributionsList } from '../AddPaper/Contributions/styled';
import StatementBrowser from '../StatementBrowser/Statements';
import { getSimilaireContribution, getResource } from '../../network';
import styled from 'styled-components';
import SimilarContributions from './SimilarContributions';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group'
import AddToComparison from './AddToComparison';
import ContentLoader from 'react-content-loader'

const Title = styled.div`
    font-size:18px;
    font-weight:500;
    margin-top:30px;
    margin-bottom:5px;

    a {
        margin-left:15px;
        span {
            font-size:80%;
        }
    }
`;

const AnimationContainer = styled.div`
    transition: 0.3s background-color,  0.3s border-color;

    &.fadeIn-enter {
        opacity:0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity:1;
        transition:0.5s opacity;
    }
`;

// TODO: right now, the reducer from addPaper is being used, since the setup of this page is very similar.
// Dependent on the future look/functionalitiy of this page, the reducers should split and renamed so viewing
// a paper is not needing a reducer that is called: addPaper (e.g. make a reducer for the statement browser?)
class Contributions extends Component {
    state = {
        selectedContribution: '',
        loading: true,
        similaireContributions: [],
        isSimilaireContributionsLoading: true,
        isSimilaireContributionsFailedLoading: false
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.paperId !== prevProps.paperId) {
            this.setState({ loading: true });
        }
        if (this.props.selectedContribution !== '' && this.props.selectedContribution !== this.state.selectedContribution) {
            this.setState({ selectedContribution: this.props.selectedContribution }, () => {
                this.handleSelectContribution(this.state.selectedContribution);
            })
        }
    }

    handleSelectContribution = (contributionId) => {
        this.setState({ loading: true, isSimilaireContributionsLoading: true });
        let contributionIsLoaded = this.props.resources.byId[contributionId] ? true : false;
        this.props.selectContribution({
            contributionId,
            contributionIsLoaded
        });
        getSimilaireContribution(this.state.selectedContribution).then((similaireContributions) => {
            var similaireContributionsData = similaireContributions.map((paper) => {
                // Fetch the data of each paper
                return getResource(paper.paperId).then((paperResource) => {
                    paper.title = paperResource.label;
                    return paper;
                })

            });
            Promise.all(similaireContributionsData).then((results) => {
                this.setState({ similaireContributions: results, isSimilaireContributionsLoading: false })
            })
        }).catch((error) => {
            this.setState({ isSimilaireContributionsLoading: false, isSimilaireContributionsFailedLoading: true })
        });
        this.setState({ loading: false });
    }

    render() {
        let selectedContributionId = this.state.selectedContribution;

        return (
            <div>
                <Container>
                    <Row noGutters={true}>
                        <Col xs="3">
                            {this.state.loading && (
                                <div>
                                    <ContentLoader
                                        height={20}
                                        width={100}
                                        speed={2}
                                        primaryColor="#E86161"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="5" rx="0" ry="0" width={100} height="15" />
                                    </ContentLoader>
                                    <ContentLoader
                                        height={40}
                                        width={100}
                                        speed={2}
                                        primaryColor="#f3f3f3"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="5" rx="0" ry="0" width={100} height="15" />
                                        <rect x="0" y="25" rx="0" ry="0" width={100} height="15" />
                                    </ContentLoader>
                                </div>
                            )}
                            {!this.state.loading && (
                                <StyledContributionsList>
                                    {this.props.contributions.map((contribution, index) => {
                                        return (
                                            <li className={contribution.id === selectedContributionId ? 'activeContribution' : ''} key={contribution.id}>
                                                <Link to={`/paper/${this.props.paperId}/${contribution.id}`} className={'selectContribution'}>
                                                    {contribution.label}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </StyledContributionsList>
                            )}
                        </Col>
                        <CSSTransitionGroup
                            transitionName="fadeIn"
                            transitionEnterTimeout={500}
                            transitionLeave={false}
                            component="div"
                            className="col-9"
                        >
                            <AnimationContainer
                                key={selectedContributionId}
                            >
                                <StyledContribution>
                                    {!this.state.loading && (
                                        <AddToComparison
                                            contributionId={selectedContributionId}
                                            paperId={this.props.paperId}
                                            paperTitle={this.props.paperTitle}
                                            contributionTitle={this.props.contributions.find(function (c) { return c.id === selectedContributionId; }).label}
                                        />
                                    )}
                                    <Form>
                                        <FormGroup>
                                            <Title style={{ marginTop: 0 }}>Research problems</Title>
                                            {this.state.loading && (
                                                <div>
                                                    <ContentLoader
                                                        height={7}
                                                        width={100}
                                                        speed={2}
                                                        primaryColor="#f3f3f3"
                                                        secondaryColor="#ecebeb"
                                                    >
                                                        <rect x="0" y="0" width="40" height="3" />
                                                        <rect x="0" y="4" width="40" height="3" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.loading && (
                                                <>
                                                    {this.props.researchProblems[selectedContributionId] && this.props.researchProblems[selectedContributionId].map((problem, index) => (
                                                        <span key={index}>

                                                            <Link to={`${process.env.PUBLIC_URL}/problem/${encodeURIComponent(problem.id)}`}>
                                                                <span className="btn btn-link p-0 border-0 align-baseline">
                                                                    {problem.label}
                                                                </span>
                                                            </Link>
                                                            <br />
                                                        </span>
                                                    ))
                                                    }
                                                </>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Title>Contribution data</Title>
                                            {this.state.loading && (
                                                <div>
                                                    <ContentLoader
                                                        height={6}
                                                        width={100}
                                                        speed={2}
                                                        primaryColor="#f3f3f3"
                                                        secondaryColor="#ecebeb"
                                                    >
                                                        <rect x="0" y="0" rx="2" ry="2" width="90" height="6" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.loading && (
                                                <StatementBrowser
                                                    enableEdit={false}
                                                    openExistingResourcesInDialog={false}
                                                />
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Title>
                                                Similar contributions
                                            </Title>
                                            {this.state.isSimilaireContributionsLoading && (
                                                <div>
                                                    <ContentLoader
                                                        height={10}
                                                        width={100}
                                                        speed={2}
                                                        primaryColor="#f3f3f3"
                                                        secondaryColor="#ecebeb"
                                                    >
                                                        <rect x="0" y="0" rx="2" ry="2" width="32" height="10" />
                                                        <rect x="33" y="0" rx="2" ry="2" width="32" height="10" />
                                                        <rect x="66" y="0" rx="2" ry="2" width="32" height="10" />
                                                    </ContentLoader>
                                                </div>
                                            )}
                                            {!this.state.isSimilaireContributionsLoading && (
                                                <>
                                                    {!this.state.isSimilaireContributionsFailedLoading ?
                                                        <SimilarContributions similaireContributions={this.state.similaireContributions.slice(0, 3)} />
                                                        : <Alert color="light">Failed to connect to the similarity service, please try again later</Alert>
                                                    }
                                                </>
                                            )}
                                            {this.state.similaireContributions.length > 0 && (
                                                <Link className="clearfix" to={`/comparison/${selectedContributionId}/${this.state.similaireContributions.slice(0, 3).map(s => s.contributionId).join('/')}`}>{/* TODO: use constants for URL */}
                                                    <span style={{ margin: '7px 5px 0 0', fontSize: '95%' }} className="float-right btn btn-link p-0 border-0 align-baseline">Compare these contributions</span>
                                                </Link>
                                            )}
                                        </FormGroup>
                                    </Form>
                                </StyledContribution>

                            </AnimationContainer>
                        </CSSTransitionGroup>
                    </Row>
                </Container>
            </div>
        );
    }
}

Contributions.propTypes = {
    researchProblems: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    selectedContribution: PropTypes.string.isRequired,
    selectContribution: PropTypes.func.isRequired,
    contributions: PropTypes.array.isRequired,
    paperId: PropTypes.string.isRequired,
    paperTitle: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    researchProblems: state.viewPaper.researchProblems,
    resources: state.statementBrowser.resources,
});

const mapDispatchToProps = dispatch => ({
    selectContribution: (data) => dispatch(selectContribution(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Contributions);