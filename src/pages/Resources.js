import React, { Component } from 'react';
import ShortRecord from '../components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getAllResources } from '../network';
import { Container } from 'reactstrap';
import ROUTES from '../constants/routes';
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
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Resources - ORKG';

        this.loadMoreResources();
    }

    loadMoreResources = () => {
        this.setState({ isNextPageLoading: true });
        getAllResources({
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(resources => {
            if (resources.length > 0) {
                this.setState({
                    resources: [...this.state.resources, ...resources],
                    isNextPageLoading: false,
                    hasNextPage: resources.length < this.pageSize ? false : true,
                    page: this.state.page + 1
                });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all resources</h1>
                </Container>
                <Container className={'box rounded pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    <div className="clearfix">
                        <Link className="float-right mb-2 mt-2 clearfix" to={ROUTES.ADD_RESOURCE}>
                            <span className="fa fa-plus" /> Create new resource
                        </Link>
                    </div>
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
                    {this.state.resources.length === 0 && !this.state.isNextPageLoading && <div className="text-center mt-4 mb-4">No Resources</div>}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMoreResources : undefined}
                        >
                            Load more resources
                        </div>
                    )}
                    {!this.state.hasNextPage && this.state.isLastPageReached && (
                        <div className="text-center mt-3">You have reached the last page.</div>
                    )}
                </Container>
            </>
        );
    }
}
