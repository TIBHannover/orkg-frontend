import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { withRouter } from 'react-router-dom'; // to access the history object
import { reverse } from 'named-urls';
import dotProp from 'dot-prop-immutable';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import ContentLoader from 'react-content-loader';
import { getResourcesByClass, getAllPredicates, getAllResources } from 'network';
import ROUTES from 'constants/routes.js';
import Results from '../components/Search/Results';
import Filters from '../components/Search/Filters';
import { toast } from 'react-toastify';

class Search extends Component {
    constructor(props) {
        super(props);

        const value = this.props.match.params.searchTerm;

        this.itemsPerFilter = 10;

        // use a map so we have an ordered object
        this.filters = new Map([
            [
                1,
                {
                    label: 'Paper',
                    labelPlural: 'Papers',
                    class: process.env.REACT_APP_CLASSES_PAPER
                }
            ],
            [
                2,
                {
                    label: 'Research Problem',
                    labelPlural: 'Research Problems',
                    class: process.env.REACT_APP_CLASSES_PROBLEM
                }
            ],
            [
                3,
                {
                    label: 'Author',
                    labelPlural: 'Authors',
                    class: process.env.REACT_APP_CLASSES_AUTHOR
                }
            ],
            [
                4,
                {
                    label: 'Comparison',
                    labelPlural: 'Comparisons',
                    class: process.env.REACT_APP_CLASSES_COMPARISON
                }
            ],
            [
                5,
                {
                    label: 'Venue',
                    labelPlural: 'Venues',
                    class: process.env.REACT_APP_CLASSES_VENUE
                }
            ],
            [
                6,
                {
                    label: 'Resource',
                    labelPlural: 'Resources',
                    class: 'resource'
                }
            ],
            [
                7,
                {
                    label: 'Predicate',
                    labelPlural: 'Predicates',
                    class: 'predicate'
                }
            ]
        ]);

        this.orkg_classes = [
            process.env.REACT_APP_CLASSES_CONTRIBUTION,
            process.env.REACT_APP_CLASSES_PAPER,
            process.env.REACT_APP_CLASSES_PROBLEM,
            process.env.REACT_APP_CLASSES_AUTHOR,
            process.env.REACT_APP_CLASSES_COMPARISON,
            process.env.REACT_APP_CLASSES_VENUE
        ];

        const selectedFilters = this.getTypesFromUrl();

        this.state = {
            value,
            selectedFilters,
            results: { ...Object.keys(this.filters).map(f => ({ [this.filters[f].class]: [] })) },
            isNextPageLoading: {},
            hasNextPage: {},
            currentPage: {},
            isLastPageReached: {}
        };
    }

    componentDidMount() {
        document.title = 'Search - ORKG';
        if (this.state.value) {
            for (const filter of this.filters) {
                this.loadMoreResults(this.state.value, filter[1].class);
            }
        }
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.searchTerm !== prevProps.match.params.searchTerm && this.props.match.params.searchTerm) {
            this.setState(
                {
                    value: this.props.match.params.searchTerm,
                    results: {},
                    isNextPageLoading: {},
                    hasNextPage: {},
                    currentPage: {},
                    isLastPageReached: {}
                },
                () => {
                    for (const filter of this.filters) {
                        this.loadMoreResults(this.state.value, filter[1].class);
                    }
                }
            );
        }
    };

    isLoading = () => {
        return Object.keys(this.state.isNextPageLoading).some(v => this.state.isNextPageLoading[v] === true);
    };

    loadMoreResults = (searchQuery, filter_type) => {
        if (searchQuery.length === 0) {
            return;
        }
        this.setState({ isNextPageLoading: { ...this.state.isNextPageLoading, [filter_type]: true } });
        let request;
        if (this.orkg_classes.includes(filter_type)) {
            request = getResourcesByClass({
                page: this.state.currentPage[filter_type] || 1,
                items: this.itemsPerFilter,
                sortBy: 'id',
                desc: true,
                q: searchQuery,
                id: filter_type
            });
        } else if (filter_type === 'predicate') {
            request = getAllPredicates({
                page: this.state.currentPage['predicate'] || 1,
                items: this.itemsPerFilter,
                sortBy: 'id',
                desc: true,
                q: searchQuery
            });
        } else {
            request = getAllResources({
                page: this.state.currentPage['resource'] || 1,
                items: this.itemsPerFilter,
                sortBy: 'id',
                desc: true,
                q: searchQuery,
                exclude: this.orkg_classes.join(',')
            });
        }
        request
            .then(results => {
                if (results.length > 0) {
                    this.setState(state => {
                        state.results[filter_type] = [...(state.results[filter_type] || []), ...results];
                        state.isNextPageLoading[filter_type] = false;
                        state.hasNextPage[filter_type] = results.length < this.itemsPerFilter ? false : true;
                        state.currentPage[filter_type] = (state.currentPage[filter_type] || 1) + 1;
                        return state;
                    });
                } else {
                    this.setState(state => {
                        state.isNextPageLoading[filter_type] = false;
                        state.hasNextPage[filter_type] = false;
                        state.isLastPageReached[filter_type] = true;
                        return state;
                    });
                }
            })
            .catch(error => {
                console.log(error);
                toast.error('Something went wrong while loading search results.');
            });
    };

    toggleFilter = filterClass => {
        let selectedFilters = [];

        if (this.state.selectedFilters.includes(filterClass)) {
            const index = this.state.selectedFilters.indexOf(filterClass);
            selectedFilters = dotProp.delete(this.state.selectedFilters, index);
        } else {
            selectedFilters = [...this.state.selectedFilters, filterClass];
        }

        this.props.history.push(reverse(ROUTES.SEARCH, { searchTerm: this.state.value }) + '?types=' + selectedFilters.join(','));

        this.setState({
            selectedFilters
        });
    };

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    getTypesFromUrl = () => {
        let types = queryString.parse(this.props.location.search, { arrayFormat: 'comma' }).types;

        if (!types) {
            return [];
        }

        if (typeof types === 'string' || types instanceof String) {
            return [parseInt(types)];
        }

        types = types.map(n => parseInt(n));

        return types;
    };

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Search results</h1>
                </Container>
                <Container className="mt-4">
                    <Row>
                        <Col className="col-sm-4 px-0">
                            <div className="box rounded mr-4 p-4 h-100">
                                <Filters
                                    loading={this.isLoading()}
                                    value={this.state.value || ''}
                                    filters={this.filters}
                                    selectedFilters={this.state.selectedFilters}
                                    handleInputChange={this.handleInputChange}
                                    toggleFilter={this.toggleFilter}
                                />
                            </div>
                        </Col>
                        <Col className="col-sm-8 px-0">
                            <div className="box rounded p-4 h-100">
                                {this.isLoading() &&
                                    Object.keys(this.state.results).every(v => this.state.results[v] && this.state.results[v].length === 0) && (
                                        <ContentLoader height={210} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                                            <rect x="0" y="8" width="50" height="15" />
                                            <rect x="0" y="25" width="100%" height="15" />
                                            <rect x="0" y="42" width="100%" height="15" />
                                            <rect x="0" y="59" width="100%" height="15" />
                                            <rect x="0" y="76" width="100%" height="15" />

                                            <rect x="0" y={8 + 100} width="50" height="15" />
                                            <rect x="0" y={25 + 100} width="100%" height="15" />
                                            <rect x="0" y={42 + 100} width="100%" height="15" />
                                            <rect x="0" y={59 + 100} width="100%" height="15" />
                                            <rect x="0" y={76 + 100} width="100%" height="15" />
                                        </ContentLoader>
                                    )}

                                {!this.props.match.params.searchTerm ||
                                (!this.isLoading() &&
                                    Object.keys(this.state.results).every(v => this.state.results[v] && this.state.results[v].length === 0)) ? (
                                    <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
                                ) : (
                                    <div>
                                        {[...this.filters.keys()].map(filterIndex => {
                                            const filter = this.filters.get(filterIndex);
                                            if (
                                                this.state.selectedFilters.length === 0 ||
                                                (this.state.selectedFilters.length > 0 && this.state.selectedFilters.includes(filterIndex))
                                            ) {
                                                return (
                                                    <div key={`filter${filterIndex}`}>
                                                        <Results
                                                            loading={this.state.isNextPageLoading[filter.class] || false}
                                                            hasNextPage={this.state.hasNextPage[filter.class] || false}
                                                            loadMore={() => this.loadMoreResults(this.state.value, filter.class)}
                                                            items={this.state.results[filter.class] || []}
                                                            label={filter.label}
                                                            class={filter.class}
                                                            showNoResultsMessage={this.state.selectedFilters.includes(filterIndex)}
                                                        />
                                                    </div>
                                                );
                                            } else {
                                                return null;
                                            }
                                        })}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

Search.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            searchTerm: PropTypes.string
        }).isRequired
    }).isRequired
};

export default withRouter(Search);
