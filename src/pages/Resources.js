import React, { Component } from 'react';
import ShortRecord from '../components/statements/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getAllResources } from '../network';
import { Container } from 'reactstrap';

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
            isLastPageReached: false,
        };
    }

    componentDidMount() {
        document.title = 'Resources - ORKG';

        this.loadMoreResources();
    }

    loadMoreResources = () => {
        this.setState({ isNextPageLoading: true })
        getAllResources({
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'id',
            desc: true
        }).then((resources) => {
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
    }

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all resources</h1>
                </Container>
                <Container className={'box pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    <div className="addResource toolbar addToolbar-container">
                        <span className="toolbar-button toolbar-button-add">
                            <Link to={`${process.env.PUBLIC_URL}/addResource`}>
                                <span className="fa fa-plus" />add new resource
                            </Link>
                        </span>
                    </div>
                    {this.state.resources.length > 0 &&
                        <div>
                            {this.state.resources.map(
                                (predicate) => {
                                    return (
                                        <ShortRecord
                                            key={predicate.id}
                                            header={predicate.id}
                                            href={`${process.env.PUBLIC_URL}/resource/${encodeURIComponent(predicate.id)}`}
                                        >
                                            {predicate.label}
                                        </ShortRecord>
                                    )
                                }
                            )}
                        </div>
                    }
                    {this.state.resources.length === 0 && !this.state.isNextPageLoading &&
                        <div className="text-center mt-4 mb-4">No Resources</div>
                    }
                    {this.state.isNextPageLoading && <div className="text-center mt-4 mb-4"><Icon icon={faSpinner} spin /> Loading</div>}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div style={{ cursor: 'pointer' }} className="list-group-item list-group-item-action text-center mt-2" onClick={!this.state.isNextPageLoading ? this.loadMoreResources : undefined}>
                            Load more resources
                        </div>
                    )}
                    {!this.state.hasNextPage && this.state.isLastPageReached && (
                        <div className="text-center mt-3">
                            You have reached the last page.
                        </div>)
                    }
                </Container>
            </>
        )
    }
}
