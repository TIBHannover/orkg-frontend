import React, { Component } from 'react';
import { getStatementsByObject, getResource } from '../network';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Container } from 'reactstrap';

export default class ResearchProblem extends Component {

    state = {
        problem: null,
        contributions: null,
    };

    async componentWillMount() {
        // Get the research problem
        await getResource(this.props.id).then((result) =>{
            this.setState({ problem: result})
        });

        // Get the contributions that are on the research problem
        let contributions = await getStatementsByObject({
            id: this.props.id,
            limit: 4,
            order: 'desc',
        })

        await Promise.all(
            // Get the papers of each contribution
            contributions.map(async (contribution, index) => {
                await getStatementsByObject({
                    id: contribution.subject.id,
                    limit: 4,
                    order: 'desc',
                }).then((result) => {
                    contributions[index].papers = result;
                    return Promise.resolve()
                });
            })
        );

        this.setState({
            contributions: contributions,
        })
    }

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View papers of <i>{this.state.problem && this.state.problem.label}</i> research problem</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5">
                    {this.state.contributions && this.state.contributions.length > 0 ?
                        <ul className="list-group list-group-flush">
                            {this.state.contributions.map(
                                resource => (
                                    <li className="list-group-item list-group-item-action" key={resource.id}>
                                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: resource.papers[0].subject.id })}>
                                            {`${resource.papers[0].subject.id}: ${resource.papers[0].subject.label}`}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                        : !this.state.contributions && <div className="text-center mt-4 mb-4"><Icon icon={faSpinner} spin /> Loading</div>}
                </Container>
            </>
        )
    }
}
