import React, { Component } from 'react';
import { getResourcesByClass, getStatementsBySubject } from '../network';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PaperCard from './../components/PaperCard/PaperCard'

export default class Papers extends Component {

    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            statements: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false,
        };
    }

    componentDidMount() {
        document.title = 'Papers - ORKG';

        this.loadMorePapers();
    }

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true })
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_PAPER,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then((papers) => {
            if (papers.length > 0) {
                // Fetch the data of each paper
                var papers_data = papers.map((paper) => {
                    return getStatementsBySubject({ id: paper.id }).then((paperStatements) => {
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
                return Promise.all(papers_data).then((statements) => {
                    this.setState({
                        statements: [...this.state.statements, ...statements],
                        isNextPageLoading: false,
                        hasNextPage: statements.length < this.pageSize ? false : true,
                        page: this.state.page + 1
                    });
                })
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }

        });


    }

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all papers</h1>
                </Container>
                <Container className={'p-0'}>
                    {this.state.statements.length > 0 &&
                        <div>
                            {this.state.statements.map(
                                (resource) => {
                                    return (
                                        <PaperCard
                                            paper={{ id: resource.id, title: resource.label, ...resource.data }}
                                            key={`pc${resource.id}`}
                                        />
                                    )
                                }
                            )}
                        </div>
                    }
                    {this.state.statements.length === 0 && !this.state.isNextPageLoading &&
                        <div className="text-center mt-4 mb-4">No Papers</div>
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
            </>
        )
    }
}
