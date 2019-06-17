import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { getStatementsByObject, getResource } from '../../network';
import ROUTES from '../../constants/routes.js';
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
        };
    }

    componentDidMount() {
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
            let papers = result.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);
            this.setState({
                papers: papers,
                loading: false
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
                            <h1 className="h4 mt-4 mb-4">View papers of <i>{this.state.researchField && this.state.researchField.label}</i> research field</h1>
                        </Container>
                        <Container className="box pt-4 pb-4 pl-5 pr-5">
                            {this.state.papers && this.state.papers.length > 0 ?
                                <ul className="list-group list-group-flush">
                                    {this.state.papers.map(
                                        resource => (
                                            <li className="list-group-item list-group-item-action" key={resource.id}>
                                                <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: resource.subject.id })}>
                                                    {`${resource.subject.id}: ${resource.subject.label}`}
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
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