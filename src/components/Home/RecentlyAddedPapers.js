import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import ROUTES from '../../constants/routes.js';
import { getStatementsByObject, getStatementsBySubject } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';

class RecentlyAddedPapers extends Component {
    state = {
        papers: null,
    }

    // TODO: replace a lot of this logic to the backend (select papers, first author and research fields)
    async componentWillMount() {
        let paperStatements = await getStatementsByObject({
            id: process.env.REACT_APP_RESOURCE_TYPES_PAPER,
            limit: 4,
            order: 'desc',
        });

        await Promise.all(
            paperStatements.map(async (paper, index) => {

                let paperItem = {
                    id: paper.subject.id,
                    label: paper.subject.label,
                    researchField: null,
                    firstAuthor: null,
                };

                let statements = await getStatementsBySubject(paper.subject.id);
                statements = statements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR || statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);
                
                statements.reverse(); // order statements to ensure that the first author statements is ordered at the top
       
                for (var i = 0; i < statements.length; i++) {
                    if (statements[i].predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD) {
                        paperItem.researchField = statements[i].object.label;
                    }
                    if (statements[i].predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR) {
                        paperItem.firstAuthor = statements[i].object.label;
                        break; // only the first author needed
                    }
                }

                paperStatements[index].paperItem = paperItem; // add to statements object to preserve order (because of the random order in which the promise might resolve)
            })
        );

        this.setState({
            papers: paperStatements,
        });
    }

    render() {
        return (
            <div className="mt-5 pl-3 pr-3">
                {this.state.papers ?
                    this.state.papers.length > 0 ?
                        <>
                            <ListGroup>
                                {this.state.papers.map((paper, index) => (
                                    <ListGroupItem key={index} className="p-0 m-0 mb-4" style={{ border: 0 }}>
                                        <h5 className="h6">
                                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.paperItem.id })} style={{ color: 'inherit' }}>
                                                {paper.paperItem.label ? paper.paperItem.label : <em>No title</em>}
                                            </Link>
                                        </h5>

                                        <span className="badge badge-lightblue"> {paper.paperItem.firstAuthor}</span> {' '}
                                        {/*<span className="badge badge-lightblue"> {paper.paperItem.researchField}</span> // reserach fields can be long which doesn't look like in a badge here*/}
                                    </ListGroupItem>
                                ))}
                            </ListGroup>

                            <div className="text-center">
                                <Link to={ROUTES.PAPERS}>
                                    <Button color="primary" className="mr-3">More papers</Button>
                                </Link>
                            </div>
                        </>
                        :
                        <div className="text-center">No papers found</div>
                    :
                    <div className="text-center">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                }
            </div>
        );
    }
}

export default RecentlyAddedPapers;