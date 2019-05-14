import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getStatementsByObject } from '../network';
import { Container } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from '../constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
/*
This page is only for debugging. It is requesting ALL statements and resources in 
order to filter out non-paper resources (very inefficient)
*/
export default class Resources extends Component {
    state = {
        statements: null,
        results: null,
    };

    async componentWillMount() {
        let statements = await getStatementsByObject({
            id: process.env.REACT_APP_RESOURCE_TYPES_PAPER,
            order: 'desc',
        });

        this.setState({
            statements
        });
    }

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all papers</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5">
                    {this.state.statements && this.state.statements.length > 0 ?
                        <ul className="list-group list-group-flush">
                            {this.state.statements.map(
                                resource => (
                                    <li className="list-group-item list-group-item-action" key={resource.id}>
                                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: resource.subject.id })}>
                                            {`${resource.subject.id}: ${resource.subject.label}`}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                        : !this.state.statements && <div className="text-center mt-4 mb-4"><Icon icon={faSpinner} spin /> Loading</div>}
                </Container>
            </>
        )
    }
}
