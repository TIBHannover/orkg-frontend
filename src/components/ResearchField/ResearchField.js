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
        this.state = {
            loading: true,
            researchField: null,
            papers: null,
            parentResearchField: null
        };
    }

    componentDidMount() {
        this.loadResearchFieldData();
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.match.params.researchFieldId !== prevProps.match.params.researchFieldId) {
            this.loadResearchFieldData();
        }
    }

    loadResearchFieldData() {
        // Get the research problem
        getResource(this.props.match.params.researchFieldId).then((result) => {
            this.setState({ researchField: result })
        });
        // Get the statements that contains the research field as an object
        getStatementsByObject({
            id: this.props.match.params.researchFieldId,
            limit: 4,
            order: 'desc',
        }).then((result) => {
            // Papers
            // Fetch the data of each paper
            let papers = result.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD)
                .map((paper) => {
                    return getStatementsBySubject(paper.subject.id).then((paperStatements) => {
                        // publication year
                        let publicationYear = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);
                        if (publicationYear.length > 0) {
                            publicationYear = publicationYear[0].object.label
                        }
                        // publication month
                        let publicationMonth = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH);
                        if (publicationMonth.length > 0) {
                            publicationMonth = publicationMonth[0].object.label
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
                    papers: papers,
                    loading: false,
                    parentResearchField: parentResearchField
                })
            })
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
                                    <div className="float-right"><b>{this.state.papers.length}</b> Papers</div>
                                    <h3 className="h4 mt-4 mb-4">{this.state.researchField && this.state.researchField.label}</h3>
                                </CardHeader>
                                <CardBody>
                                    <CardText>
                                        Description text
                                    </CardText>
                                </CardBody>
                                {this.state.parentResearchField && (
                                    <CardFooter>
                                        Parent research field:
                                        <Link className={'ml-2'} to={reverse(ROUTES.RESEARCH_FIELD, {researchFieldId: this.state.parentResearchField.subject.id})} >
                                            {this.state.parentResearchField.subject.label}
                                        </Link>
                                    </CardFooter>
                                )}

                            </Card>
                        </Container>
                        <br />
                        <Container>
                            {this.state.papers && this.state.papers.length > 0 ?
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
                                : (
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