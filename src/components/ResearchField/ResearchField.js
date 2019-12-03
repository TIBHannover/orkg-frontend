import React, { Component } from 'react';
import { Container, Button, Card, CardText, CardBody, CardHeader, CardFooter } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getStatementsByObject, getResource, getStatementsBySubjects } from '../../network';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import PaperCard from '../PaperCard/PaperCard';
import { get_paper_data } from 'utils';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

class ResearchField extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            loading: true,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            researchField: null,
            papers: [],
            parentResearchField: null,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        this.loadResearchFieldData();
        this.loadMorePapers();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.researchFieldId !== prevProps.match.params.researchFieldId) {
            this.setState({
                loading: true,
                isNextPageLoading: false,
                hasNextPage: false,
                page: 1,
                researchField: null,
                papers: [],
                parentResearchField: null,
                isLastPageReached: false
            });
            this.loadResearchFieldData();
            this.loadMorePapers();
        }
    };

    loadResearchFieldData = () => {
        // Get the research field
        getResource(this.props.match.params.researchFieldId).then(result => {
            this.setState({ researchField: result, papers: [], loading: false }, () => {
                document.title = `${this.state.researchField.label} - ORKG`;
            });
        });
    };

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });
        // Get the statements that contains the research field as an object
        getStatementsByObject({
            id: this.props.match.params.researchFieldId,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(result => {
            // Papers
            if (result.length > 0) {
                let parentResearchField = result.find(statement => statement.predicate.id === 'P36');
                // Fetch the data of each paper
                getStatementsBySubjects(
                    result.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD).map(p => p.subject.id)
                )
                    .then(papersStatements => {
                        let papers = papersStatements.map(paperStatements => {
                            return get_paper_data(paperStatements.statements);
                        });
                        this.setState({
                            papers: [...this.state.papers, ...papers],
                            parentResearchField: parentResearchField,
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
                        <Container>
                            <Card>
                                <CardHeader>
                                    {/* TODO: Show the total number of papers when number of items is provided with the paginated result
                                        <div className="float-right"><b>{this.state.papers.length}</b> Papers</div>
                                    */}
                                    <h3 className="h4 mt-4 mb-4">{this.state.researchField && this.state.researchField.label}</h3>
                                </CardHeader>
                                <CardBody>
                                    <CardText>
                                        List of papers in <i>{this.state.researchField && this.state.researchField.label}</i> research field
                                    </CardText>
                                </CardBody>
                                {this.state.parentResearchField && (
                                    <CardFooter>
                                        Parent research field:
                                        <Link
                                            className={'ml-2'}
                                            to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: this.state.parentResearchField.subject.id })}
                                        >
                                            {this.state.parentResearchField.subject.label}
                                        </Link>
                                    </CardFooter>
                                )}
                            </Card>
                        </Container>
                        <br />
                        <Container>
                            {this.state.papers.length > 0 && (
                                <div>
                                    {this.state.papers.map(resource => {
                                        return <PaperCard paper={{ title: resource.label, ...resource }} key={`pc${resource.id}`} />;
                                    })}
                                </div>
                            )}
                            {this.state.papers.length === 0 && !this.state.isNextPageLoading && (
                                <div className="text-center mt-4 mb-4">
                                    There are no articles for this research field, yet.
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
                        </Container>
                    </div>
                )}
            </>
        );
    }
}

ResearchField.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchFieldId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchField;
