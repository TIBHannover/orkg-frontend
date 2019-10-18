import React, { Component } from 'react';
import { Container, Button, Card, CardText, CardBody, CardHeader, CardFooter } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getStatementsByObject, getResource, getStatementsBySubject } from '../../network';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import PaperCard from '../PaperCard/PaperCard'
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
            isLastPageReached: false,
        };
    }

    componentDidMount() {
        this.loadResearchFieldData();
        this.loadMorePapers();
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.match.params.researchFieldId !== prevProps.match.params.researchFieldId) {
            this.loadResearchFieldData();
            this.loadMorePapers();
        }
    }

    loadResearchFieldData = () => {
        // Get the research field
        getResource(this.props.match.params.researchFieldId).then((result) => {
            this.setState({ researchField: result, papers: [], loading: false })
            document.title = `${this.state.researchField.label} - ORKG`
        });
    }

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true })
        // Get the statements that contains the research field as an object
        getStatementsByObject({
            id: this.props.match.params.researchFieldId,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'id',
            desc: true
        }).then((result) => {
            // Papers
            if (result.length > 0) {
                // Fetch the data of each paper
                let papers = result.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD)
                    .map((paper) => {
                        return getStatementsBySubject({ id: paper.subject.id }).then((paperStatements) => {
                            // publication year
                            let publicationYear = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);
                            if (publicationYear.length > 0) {
                                publicationYear = publicationYear[0].object.label
                            } else {
                                publicationYear = ''
                            }
                            // publication month
                            let publicationMonth = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH);
                            if (publicationMonth.length > 0) {
                                publicationMonth = publicationMonth[0].object.label
                            } else {
                                publicationMonth = ''
                            }
                            // authors
                            let authors = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);
                            let authorNamesArray = [];
                            if (authors.length > 0) {
                                for (let author of authors) {
                                    let authorName = author.object.label;
                                    authorNamesArray.push(authorName);
                                }
                            }
                            paper.data = {
                                publicationYear,
                                publicationMonth,
                                authorNames: authorNamesArray.reverse(),
                            }
                            return paper;
                        })
                    });
                let parentResearchField = result.find((statement) => statement.predicate.id === 'P36');
                return Promise.all(papers).then((papers) => {
                    this.setState({
                        papers: [...this.state.papers, ...papers],
                        parentResearchField: parentResearchField,
                        isNextPageLoading: false,
                        hasNextPage: (papers.length < this.pageSize || papers.length === 0) ? false : true,
                        page: this.state.page + 1
                    })
                })
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        })
    }

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
                                        <Link className={'ml-2'} to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: this.state.parentResearchField.subject.id })} >
                                            {this.state.parentResearchField.subject.label}
                                        </Link>
                                    </CardFooter>
                                )}

                            </Card>
                        </Container>
                        <br />
                        <Container>
                            {this.state.papers.length > 0 &&
                                <div>
                                    {this.state.papers.map(
                                        (resource) => {
                                            return (
                                                <PaperCard
                                                    paper={{ id: resource.subject.id, title: resource.subject.label, ...resource.data }}
                                                    key={`pc${resource.id}`}
                                                />
                                            )
                                        }
                                    )}
                                </div>
                            }
                            {this.state.papers.length === 0 && !this.state.isNextPageLoading &&
                                (
                                    <div className="text-center mt-4 mb-4">
                                        There are no articles for this research field, yet.
                                        <br />
                                        Start the graphing in ORKG by sharing a paper.
                                        <br />
                                        <br />
                                        <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                            <Button size="sm" color="primary " className="mr-3">Share paper</Button>
                                        </Link>
                                    </div>
                                )
                            }
                            {this.state.isNextPageLoading && <div className="text-center mt-4 mb-4"><Icon icon={faSpinner} spin /> Loading</div>}
                            {!this.state.isNextPageLoading && this.state.hasNextPage && (
                                <div style={{ cursor: 'pointer' }} className="list-group-item list-group-item-action text-center mt-2" onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}>
                                    Load more papers
                                </div>
                            )}
                            {!this.state.hasNextPage && this.state.isLastPageReached && (
                                <div className="text-center mt-3">
                                    You have reached the last page.
                                </div>)
                            }
                        </Container>
                    </div>
                )}
            </>
        )
    }
}

ResearchField.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchFieldId: PropTypes.string,
        }).isRequired,
    }).isRequired,
}

export default ResearchField;