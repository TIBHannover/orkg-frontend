import React, { Component } from 'react';
import ShortRecord from '../components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getAllPredicates } from '../network';
import { Container } from 'reactstrap';

export default class Predicates extends Component {

    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            predicates: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false,
        };
    }

    componentDidMount() {
        document.title = 'Predicates - ORKG';

        this.loadMorePredicates();
    }


    loadMorePredicates = () => {
        this.setState({ isNextPageLoading: true })
        getAllPredicates({
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then((predicates) => {
            if (predicates.length > 0) {
                this.setState({
                    predicates: [...this.state.predicates, ...predicates],
                    isNextPageLoading: false,
                    hasNextPage: predicates.length < this.pageSize ? false : true,
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
                    <h1 className="h4 mt-4 mb-4">View all predicates</h1>
                </Container>
                <Container className={'box pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    {this.state.predicates.length > 0 &&
                        <div>
                            {this.state.predicates.map(
                                (predicate) => {
                                    return (
                                        <ShortRecord
                                            key={predicate.id}
                                            header={predicate.id}
                                            href={`${process.env.PUBLIC_URL}/predicate/${encodeURIComponent(predicate.id)}`}
                                        >
                                            {predicate.label}
                                        </ShortRecord>
                                    )
                                }
                            )}
                        </div>
                    }
                    {this.state.predicates.length === 0 && !this.state.isNextPageLoading &&
                        <div className="text-center mt-4 mb-4">No Predicates</div>
                    }
                    {this.state.isNextPageLoading && <div className="text-center mt-4 mb-4"><Icon icon={faSpinner} spin /> Loading</div>}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div style={{ cursor: 'pointer' }} className="list-group-item list-group-item-action text-center mt-2" onClick={!this.state.isNextPageLoading ? this.loadMorePredicates : undefined}>
                            Load more predicates
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
