import React, { Component } from 'react';
import { getStatementsByObject, getResource } from '../network';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Container } from 'reactstrap';

export default class ResearchField extends Component {

    state = {
        field: null,
        papers: null,
    };

    async componentWillMount() {
        // Get the research problem
        await getResource(this.props.id).then((result) =>{
            this.setState({ field: result})
        });

        // Get the statements that contains the research field as an object
        let fieldStatements = await getStatementsByObject({
            id: this.props.id,
            limit: 4,
            order: 'desc',
        })

        // papers
        let papers = fieldStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);

        this.setState({
            papers: papers,
        })
    }

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View papers of <i>{this.state.field && this.state.field.label}</i> research field</h1>
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
                        : !this.state.papers && <div className="text-center mt-4 mb-4"><Icon icon={faSpinner} spin /> Loading</div>}
                </Container>
            </>
        )
    }
}
