import React, { Component } from 'react';
import { getStatementsByObject, getStatementsBySubject } from '../network';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PaperCard from './../components/PaperCard/PaperCard'
/*
This page is only for debugging. It is requesting ALL statements and resources in 
order to filter out non-paper resources (very inefficient)
*/
export default class Resources extends Component {
    state = {
        statements: null,
        results: null,
    };

    componentDidMount() {
        getStatementsByObject({
            id: process.env.REACT_APP_RESOURCE_TYPES_PAPER,
            order: 'desc',
        }).then((papers) => {
            // Fetch the data of each paper
            var papers_data = papers.map((paper) => {
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
            return Promise.all(papers_data).then((statements) => {
                this.setState({
                    statements
                });
            })
        });
    }

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all papers</h1>
                </Container>
                <Container className={'p-0'}>
                    {this.state.statements && this.state.statements.length > 0 ?
                        <div>
                            {this.state.statements.map(
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
                        : !this.state.statements && <div className="text-center mt-4 mb-4"><Icon icon={faSpinner} spin /> Loading</div>}
                </Container>
            </>
        )
    }
}
