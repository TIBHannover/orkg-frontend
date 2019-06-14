import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup } from 'reactstrap';
import { connect } from 'react-redux';
import { selectContribution } from '../../actions/viewPaper';
import styles from '../AddPaper/Contributions/Contributions.module.scss';
import StatementBrowser from '../StatementBrowser/Statements';
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
        this.setState({ loading: true });
        let contributionIsLoaded = this.props.resources.byId[contributionId] ? true : false;
        this.props.selectContribution({
            contributionId,
            contributionIsLoaded
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
                                <ul className={styles.contributionsList}>
                                    {this.props.contributions.map((contribution, index) => {
                                        return (
                                            <li className={contribution.id === selectedContributionId ? styles.activeContribution : ''} key={contribution.id}>
                                                <Link to={`/paper/${this.props.paperId}/${contribution.id}`} className={styles.selectContribution}>
                                                    {contribution.label}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
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
                                <div className={styles.contribution}>
                                    <AddToComparison
                                        contributionId={selectedContributionId}
                                        paperId={this.props.paperId}
                                        paperTitle={this.props.paperTitle}
                                        contributionTitle="Contribution"
                                    />
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
                                                <Link to={`/comparison/${this.props.paperId}/${this.props.selectedContribution}`}>{/* TODO: use constants for URL */}
                                                    <span className="btn btn-link p-0 border-0 align-baseline" onClick={this.handleComparisonClick}>Show full comparison</span>
                                                </Link>
                                            </Title>
                                            {this.state.loading && (
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
                                            {!this.state.loading && (
                                                <SimilarContributions />
                                            )}

                                        </FormGroup>
                                    </Form>
                                </div>

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