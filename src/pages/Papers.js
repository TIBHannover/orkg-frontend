import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getStatementsByObject } from '../network';
import { Container } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from '../constants/routes.js';

/*
This page is only for debugging. It is requesting ALL statements and resources in 
order to filter out non-paper resources (very inefficient)
*/
export default class Resources extends Component {
    state = {
        statements: [],
        results: null,
    };

    async componentWillMount() {
        let statements = await getStatementsByObject({id: process.env.REACT_APP_RESOURCE_TYPES_PAPER});

        this.setState({
            statements
        });
    }

    render() {
        if (this.state.statements && this.state.statements.length > 0) {
            const resources = this.state.statements.map(
                resource => (
                    <div className="shortRecord" key={resource.id}>
                        <div className="shortRecord-header">
                            <Link to={reverse(ROUTES.VIEW_PAPER, {resourceId: resource.subject.id})} style={{ color: 'inherit' }}>
                                {`${resource.subject.id}: ${resource.subject.label}`}
                            </Link>
                        </div>
                    </div>
                )
            );

            return (
                <>
                    <Container className="p-0">
                        <h1 className="h4 mt-4 mb-4">View all papers</h1>
                    </Container>
                    <Container className="box pt-4 pb-4 pl-5 pr-5">
                        {resources}
                    </Container>
                </>
            )
        } else {
            return null;
        }
    }
}
