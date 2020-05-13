import React, { Component } from 'react';
import { getResourcesByClass, getStatementsBySubjects } from '../network';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getComparisonData } from 'utils';
import { find } from 'lodash';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';

export default class Comparisons extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            statements: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Published comparisons - ORKG';

        this.loadMoreComparisons();
    }

    loadMoreComparisons = () => {
        this.setState({ isNextPageLoading: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_COMPARISON,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(comparisons => {
            if (comparisons.length > 0) {
                // Fetch the data of each paper
                getStatementsBySubjects({ ids: comparisons.map(p => p.id) })
                    .then(comparisonsStatements => {
                        const statements = comparisonsStatements.map(comparisonStatements => {
                            return getComparisonData(
                                comparisonStatements.id,
                                find(comparisons, { id: comparisonStatements.id }).label,
                                comparisonStatements.statements
                            );
                        });
                        this.setState({
                            statements: [...this.state.statements, ...statements],
                            isNextPageLoading: false,
                            hasNextPage: statements.length < this.pageSize ? false : true,
                            page: this.state.page + 1
                        });
                    })
                    .catch(error => {
                        this.setState({
                            isNextPageLoading: false,
                            hasNextPage: false,
                            isLastPageReached: true
                        });
                        console.log(error);
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
                    <h1 className="h4 mt-4 mb-4">View all published comparisons</h1>
                </Container>

                <Container className={'p-0'}>
                    {this.state.statements.length > 0 && (
                        <div>
                            {this.state.statements.map(resource => {
                                return <ComparisonCard comparison={{ ...resource }} key={`pc${resource.id}`} />;
                            })}
                        </div>
                    )}
                    {this.state.statements.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No published comparison</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMoreComparisons : undefined}
                        >
                            Load more comparisons
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
