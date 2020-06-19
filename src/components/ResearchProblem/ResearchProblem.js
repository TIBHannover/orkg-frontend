import React, { Component } from 'react';
import { Container, Button, Card, CardText, CardBody, CardHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLink } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import Tippy from '@tippy.js/react';
import { getStatementsByObject, getResource, getStatementsBySubject } from 'network';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import PaperCard from 'components/PaperCard/PaperCard';
import ExternalDescription from './ExternalDescription';
import ROUTES from 'constants/routes';
import { filterObjectOfStatementsByPredicate, getPaperData } from 'utils';

class ResearchProblem extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            loading: true,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            researchProblem: null,
            description: '',
            sameAs: '',
            contributions: [],
            isLastPageReached: false
        };
    }

    componentDidMount() {
        this.loadResearchProblemData();
        this.loadMorePapers();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.researchProblemId !== prevProps.match.params.researchProblemId) {
            this.setState({
                loading: true,
                isNextPageLoading: false,
                hasNextPage: false,
                page: 1,
                researchProblem: null,
                contributions: [],
                isLastPageReached: false
            });
            this.loadResearchProblemData();
            this.loadMorePapers();
        }
    };

    loadResearchProblemData = () => {
        // Get the research problem
        getResource(this.props.match.params.researchProblemId).then(result => {
            this.setState({ researchProblem: result, contributions: [], loading: false }, () => {
                document.title = `${this.state.researchProblem.label} - ORKG`;
            });
        });

        // Get description of the research problem
        getStatementsBySubject({ id: this.props.match.params.researchProblemId }).then(statements => {
            const description = filterObjectOfStatementsByPredicate(statements, process.env.REACT_APP_PREDICATES_DESCRIPTION, true);
            if (description) {
                this.setState({ description: description.label });
            } else {
                const sameAs = filterObjectOfStatementsByPredicate(statements, process.env.REACT_APP_PREDICATES_SAME_AS, true);
                this.setState({ sameAs: sameAs });
            }
        });
    };

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });
        // Get the statements that contains the research field as an object
        getStatementsByObject({
            id: this.props.match.params.researchProblemId,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(result => {
            // Papers
            if (result.length > 0) {
                // Get the papers of each contribution, ensure all papers have the 'Paper' class
                const papers = result
                    .filter(contribution => contribution.subject.classes.includes(process.env.REACT_APP_CLASSES_CONTRIBUTION))
                    .map(contribution => {
                        return getStatementsByObject({
                            id: contribution.subject.id,
                            order: 'desc'
                        }).then(papers => {
                            // Fetch the data of each paper
                            const papersData = papers
                                .filter(paper => paper.subject.classes.includes(process.env.REACT_APP_CLASSES_PAPER))
                                .map(paper => {
                                    return getStatementsBySubject({ id: paper.subject.id }).then(paperStatements => {
                                        return { ...paper, data: getPaperData(paper.subject.id, paper.subject.label, paperStatements) };
                                    });
                                });
                            return Promise.all(papersData).then(results => {
                                contribution.papers = results;
                                return contribution.papers.length > 0 ? contribution : null;
                            });
                        });
                    });

                Promise.all(papers).then(results => {
                    this.setState({
                        contributions: [...this.state.contributions, ...results],
                        isNextPageLoading: false,
                        hasNextPage: results.length < this.pageSize || results.length === 0 ? false : true,
                        page: this.state.page + 1
                    });
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

    render() {
        return (
            <>
                {this.state.loading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
                {!this.state.loading && (
                    <div>
                        <Container className="p-0">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">Research Problem</h1>
                        </Container>
                        <Container className="p-0">
                            <Card>
                                <CardHeader>
                                    {/* TODO: Show the total number of contributions when number of items is provided with the paginated result
                                        <div className="float-right"><b>{this.state.contributions.length}</b> Contributions</div>
                                    */}
                                    <h2 className="h4 mb-1">
                                        {this.state.researchProblem && this.state.researchProblem.label}
                                        <Tippy content="Go to resource page">
                                            <Link
                                                className="h6 ml-2 text-secondary"
                                                to={reverse(ROUTES.RESOURCE, { id: this.state.researchProblem.id })}
                                            >
                                                <Icon icon={faLink} />
                                            </Link>
                                        </Tippy>
                                    </h2>
                                </CardHeader>
                                <CardBody>
                                    {this.state.description && <CardText>{this.state.description}</CardText>}
                                    {!this.state.description && (
                                        <ExternalDescription query={this.state.sameAs ? this.state.sameAs.label : this.state.researchProblem.label} />
                                    )}
                                </CardBody>
                            </Card>
                        </Container>
                        <Container className="p-0">
                            <h1 className="h4 mt-4 mb-4 flex-grow-1">Papers</h1>
                        </Container>
                        <Container className="p-0">
                            {this.state.contributions.length > 0 && (
                                <div>
                                    {this.state.contributions.map(contribution => {
                                        return (
                                            contribution && (
                                                <PaperCard
                                                    paper={{
                                                        id: contribution.papers[0].subject.id,
                                                        title: contribution.papers[0].subject.label,
                                                        ...contribution.papers[0].data
                                                    }}
                                                    contribution={{ id: contribution.subject.id, title: contribution.subject.label }}
                                                    key={`pc${contribution.id}`}
                                                />
                                            )
                                        );
                                    })}
                                </div>
                            )}
                            {this.state.contributions.length === 0 && !this.state.isNextPageLoading && (
                                <div className="text-center mt-4 mb-4">
                                    There are no articles for this research problem, yet.
                                    <br />
                                    Start the graphing in ORKG by sharing a paper.
                                    <br />
                                    <br />
                                    <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                        <Button size="sm" color="primary " className="mr-3">
                                            Share paper
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {this.state.isNextPageLoading && (
                                <div className="text-center mt-4 mb-4">
                                    <Icon icon={faSpinner} spin /> Loading
                                </div>
                            )}
                            {!this.state.isNextPageLoading && this.state.hasNextPage && (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    className="list-group-item list-group-item-action text-center mt-2"
                                    onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                                >
                                    Load more papers
                                </div>
                            )}
                            {!this.state.hasNextPage && this.state.isLastPageReached && (
                                <div className="text-center mt-3">You have reached the last page.</div>
                            )}
                            <ComparisonPopup />
                        </Container>
                    </div>
                )}
            </>
        );
    }
}

ResearchProblem.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchProblemId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchProblem;
