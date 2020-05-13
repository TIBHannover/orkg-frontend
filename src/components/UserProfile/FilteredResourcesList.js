import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import { getStatementsBySubjects, getResourcesByClass } from 'network';
import { getPaperData, getComparisonData } from 'utils';
import { find } from 'lodash';

class FilteredResourcesList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            resources: [],
            isLastPageReached: false
        };

        this.pageSize = 5;
    }

    componentDidMount() {
        this.loadMoreResources();
    }

    loadMoreResources = () => {
        this.setState({ isNextPageLoading: true });

        getResourcesByClass({
            id: this.props.filterClass,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'id',
            desc: true,
            creator: this.props.userId
        }).then(result => {
            // Resources
            if (result.length > 0) {
                // Fetch the data of each resource
                getStatementsBySubjects({
                    ids: result.map(p => p.id)
                })
                    .then(resourcesStatements => {
                        const resources = resourcesStatements.map(resourceStatements => {
                            const resourceSubject = find(result, { id: resourceStatements.id });
                            if (this.props.filterClass === process.env.REACT_APP_CLASSES_PAPER) {
                                return getPaperData(
                                    resourceStatements.id,
                                    resourceStatements && resourceSubject.label ? resourceSubject.label : 'No Title',
                                    resourceStatements.statements
                                );
                            }
                            if (this.props.filterClass === process.env.REACT_APP_CLASSES_COMPARISON) {
                                return getComparisonData(
                                    resourceStatements.id,
                                    resourceStatements && resourceSubject.label ? resourceSubject.label : 'No Title',
                                    resourceStatements.statements
                                );
                            }
                            return null;
                        });
                        this.setState({
                            resources: [...this.state.resources, ...resources],
                            isNextPageLoading: false,
                            hasNextPage: resources.length < this.pageSize || resources.length === 0 ? false : true,
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
            <div>
                {this.state.resources.length > 0 && (
                    <div>
                        {this.state.resources.map(resource => {
                            if (this.props.filterClass === process.env.REACT_APP_CLASSES_PAPER) {
                                return <PaperCard paper={{ title: resource.label, ...resource }} key={`pc${resource.id}`} />;
                            }
                            if (this.props.filterClass === process.env.REACT_APP_CLASSES_COMPARISON) {
                                return <ComparisonCard comparison={{ ...resource }} key={`pc${resource.id}`} />;
                            }
                            return null;
                        })}
                        {!this.state.isNextPageLoading && this.state.hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!this.state.isNextPageLoading ? this.loadMoreResources : undefined}
                            >
                                View more {this.props.filterLabel}
                            </div>
                        )}
                    </div>
                )}

                {this.state.resources.length === 0 && !this.state.isNextPageLoading && (
                    <div className="text-center mb-2">This user hasn't added any {this.props.filterLabel} to ORKG yet.</div>
                )}
            </div>
        );
    }
}

FilteredResourcesList.propTypes = {
    userId: PropTypes.string.isRequired,
    filterLabel: PropTypes.string.isRequired,
    filterClass: PropTypes.string.isRequired
};

export default FilteredResourcesList;
