import React, { Component } from 'react';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { getResources } from 'services/backend/resources';
import { Container, ListGroup, ListGroupItem } from 'reactstrap';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';

export default class Resources extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            resources: [],
            results: null,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 0,
            isLastPageReached: false,
            totalElements: 0
        };
    }

    componentDidMount() {
        document.title = 'Resources - ORKG';

        this.loadMoreResources();
    }

    loadMoreResources = () => {
        this.setState({ isNextPageLoading: true });
        getResources({
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(result => {
            this.setState({
                resources: [...this.state.resources, ...result.content],
                isNextPageLoading: false,
                hasNextPage: !result.last,
                isLastPageReached: result.last,
                page: this.state.page + 1,
                totalElements: result.totalElements
            });
        });
    };

    render() {
        return (
            <>
                <Container className="d-flex mt-4 mb-4">
                    <div className="d-flex flex-grow-1">
                        <h1 className="h4">View all resources</h1>
                        <div className="text-muted ml-3 mt-1">{this.state.totalElements} resource</div>
                    </div>
                    <div className="flex-shrink-0">
                        <RequireAuthentication
                            component={Link}
                            color="darkblue"
                            size="sm"
                            className="btn btn-darkblue btn-sm"
                            to={ROUTES.ADD_RESOURCE}
                        >
                            <Icon icon={faPlus} /> Create resource
                        </RequireAuthentication>
                    </div>
                </Container>
                <Container className="p-0">
                    <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                        {this.state.resources.length > 0 && (
                            <div>
                                {this.state.resources.map(resource => {
                                    return (
                                        <ShortRecord key={resource.id} header={resource.label} href={reverse(ROUTES.RESOURCE, { id: resource.id })}>
                                            {resource.id}
                                        </ShortRecord>
                                    );
                                })}
                            </div>
                        )}
                        {this.state.totalElements === 0 && !this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                No Resources
                            </ListGroupItem>
                        )}
                        {this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </ListGroupItem>
                        )}
                        {!this.state.isNextPageLoading && this.state.hasNextPage && (
                            <ListGroupItem
                                style={{ cursor: 'pointer' }}
                                className="text-center"
                                action
                                onClick={!this.state.isNextPageLoading ? this.loadMoreResources : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more resources
                            </ListGroupItem>
                        )}
                        {!this.state.hasNextPage && this.state.isLastPageReached && (
                            <ListGroupItem tag="div" className="text-center">
                                You have reached the last page.
                            </ListGroupItem>
                        )}
                    </ListGroup>
                </Container>
            </>
        );
    }
}
