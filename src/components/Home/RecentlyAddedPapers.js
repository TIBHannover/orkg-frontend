import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import { getResourcesByClass, getStatementsBySubjects } from '../../network';
import { getPaperData } from 'utils';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';

class RecentlyAddedPapers extends Component {
    state = {
        papers: null
    };

    // TODO: replace a lot of this logic to the backend (select papers, first author and research fields)
    async componentDidMount() {
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_PAPER,
            page: 1,
            items: 4,
            sortBy: 'created_at',
            desc: true
        }).then(paperStatements => {
            if (paperStatements.length > 0) {
                // Fetch the data of each paper
                getStatementsBySubjects({ ids: paperStatements.map(p => p.id) })
                    .then(papersStatements => {
                        let papers = papersStatements.map(paperStatements => {
                            return getPaperData(paperStatements.statements);
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
            <div className="mt-5 pl-3 pr-3">
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
