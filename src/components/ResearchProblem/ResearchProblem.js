import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { getStatementsByObject, getResource } from '../../network';
import ROUTES from '../../constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import PropTypes from 'prop-types';

class ResearchProblem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            researchProblem: null,
            contributions: null
        };
    }

    componentDidMount() {
        // Get the research problem
        getResource(this.props.match.params.researchProblemId).then((result) => {
            this.setState({ researchProblem: result })
        });

        // Get the contributions that are on the research problem
        getStatementsByObject({
            id: this.props.match.params.researchProblemId,
            limit: 4,
            order: 'desc',
        }).then((result) => {
            // Get the papers of each contribution
            var papers = result.map((contribution) => {
                return getStatementsByObject({
                    id: contribution.subject.id,
                    limit: 4,
                    order: 'desc',
                }).then((result) => {
                    contribution.papers = result;
                    return contribution
                });
            })
            Promise.all(papers).then((results) => {
                this.setState({
                    contributions: results,
                    loading: false
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
                        <Container className="p-0">
                            <h1 className="h4 mt-4 mb-4">View papers of <i>{this.state.researchProblem && this.state.researchProblem.label}</i> research problem</h1>
                        </Container>
                        <Container className="box pt-4 pb-4 pl-5 pr-5">
                            {this.state.contributions && this.state.contributions.length > 0 ?
                                <ul className="list-group list-group-flush">
                                    {this.state.contributions.map(
                                        (resource) => {
                                            return (
                                                <li className="list-group-item list-group-item-action" key={resource.id}>
                                                    <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: resource.papers[0].subject.id })}>
                                                        {`${resource.papers[0].subject.id}: ${resource.papers[0].subject.label}`}
                                                    </Link>
                                                </li>
                                            )
                                        }
                                    )}
                                </ul>
                                : (
                                    <div className="text-center mt-4 mb-4">
                                        There are no articles for this research problem, yet.
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

ResearchProblem.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchProblemId: PropTypes.string,
        }).isRequired,
    }).isRequired,
}

export default ResearchProblem;