import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/classes';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { CLASSES } from 'constants/graphSettings';

class RecentlyAddedPapers extends Component {
    state = {
        papers: null
    };

    // TODO: replace a lot of this logic to the backend (select papers, first author and research fields)
    async componentDidMount() {
        getResourcesByClass({
            id: CLASSES.PAPER,
            page: 1,
            items: 7,
            sortBy: 'created_at',
            desc: true
        }).then(result => {
            if (result.length > 0) {
                // Fetch the data of each paper
                getStatementsBySubjects({ ids: result.map(p => p.id) })
                    .then(papersStatements => {
                        const papers = papersStatements.map(paperStatements => {
                            const paperSubject = find(result, { id: paperStatements.id });
                            return getPaperData(
                                paperStatements.id,
                                paperSubject && paperSubject.label ? paperSubject.label : 'No Title',
                                paperStatements.statements
                            );
                        });
                        this.setState({
                            papers: papers
                        });
                    })
                    .catch(error => {
                        this.setState({
                            papers: null
                        });
                        console.log(error);
                    });
            } else {
                this.setState({
                    papers: []
                });
            }
        });
    }

    render() {
        return (
            <div className="pl-3 pr-3 p-4">
                {this.state.papers ? (
                    this.state.papers.length > 0 ? (
                        <>
                            <ListGroup>
                                {this.state.papers.map((paper, index) => (
                                    <ListGroupItem key={index} className="p-0 m-0 mb-4" style={{ border: 0 }}>
                                        <h5 className="h6">
                                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.id })} style={{ color: 'inherit' }}>
                                                {paper.label ? paper.label : <em>No title</em>}
                                            </Link>
                                        </h5>
                                        {paper.authorNames && paper.authorNames.length > 0 && (
                                            <span className="badge badge-lightblue"> {paper.authorNames[0].label}</span>
                                        )}

                                        {/*<span className="badge badge-lightblue"> {paper.paperItem.researchField}</span> // reserach fields can be long which doesn't look like in a badge here*/}
                                    </ListGroupItem>
                                ))}
                            </ListGroup>

                            <div className="text-center">
                                <Link to={ROUTES.PAPERS}>
                                    <Button color="primary" className="mr-3" size="sm">
                                        More papers
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">No papers found</div>
                    )
                ) : (
                    <div className="text-center">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </div>
        );
    }
}

export default RecentlyAddedPapers;
