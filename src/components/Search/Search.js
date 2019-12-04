import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { getResourcesByClass, getAllPredicates, getAllResources } from '../../network';
import ROUTES from '../../constants/routes.js';
import { reverse } from 'named-urls';
import dotProp from 'dot-prop-immutable';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Results from './Results';
import Filters from './Filters';

class Search extends Component {
    constructor(props) {
        super(props);

        let value = this.props.match.params.searchTerm;

        this.itemsPerFilter = 10;

        // use a map so we have an ordered object
        this.filters = new Map([
            [
                1,
                {
                    label: 'Paper',
                    class: process.env.REACT_APP_CLASSES_PAPER
                }
            ],
            [
                2,
                {
                    label: 'Research Problem',
                    class: process.env.REACT_APP_CLASSES_PROBLEM
                }
            ],
            [
                3,
                {
                    label: 'Resource',
                    class: 'resource'
                }
            ],
            [
                4,
                {
                    label: 'Predicate',
                    class: 'predicate'
                }
            ]
        ]);

        const selectedFilters = this.getTypesFromUrl();

        this.state = {
            value,
            selectedFilters,
            resources: [],
            isResourcesNextPageLoading: false,
            hasResourcesNextPage: false,
            resourcesPage: 1,
            isResourcesLastPageReached: false,

            predicates: [],
            isPredicatesNextPageLoading: false,
            hasPredicatesNextPage: false,
            predicatesPage: 1,
            isPredicatesLastPageReached: false,

            papers: [],
            isPapersNextPageLoading: false,
            hasPapersNextPage: false,
            papersPage: 1,
            isPapersLastPageReached: false,

            problems: [],
            isProblemsNextPageLoading: false,
            hasProblemsNextPage: false,
            problemsPage: 1,
            isProblemsLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Search - ORKG';
        this.loadMoreResources(this.state.value);
        this.loadMorePapers(this.state.value);
        this.loadMoreProblems(this.state.value);
        this.loadMorePredicates(this.state.value);
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.match.params.searchTerm !== prevProps.match.params.searchTerm) {
            this.setState(
                {
                    value: this.props.match.params.searchTerm,
                    resources: [],
                    isResourcesNextPageLoading: false,
                    hasResourcesNextPage: false,
                    resourcesPage: 1,
                    isResourcesLastPageReached: false,
                    predicates: [],
                    isPredicatesNextPageLoading: false,
                    hasPredicatesNextPage: false,
                    predicatesPage: 1,
                    isPredicatesLastPageReached: false,
                    papers: [],
                    isPapersNextPageLoading: false,
                    hasPapersNextPage: false,
                    papersPage: 1,
                    isPapersLastPageReached: false,
                    problems: [],
                    isProblemsNextPageLoading: false,
                    hasProblemsNextPage: false,
                    problemsPage: 1,
                    isProblemsLastPageReached: false
                },
                () => {
                    this.loadMoreResources(this.state.value);
                    this.loadMorePapers(this.state.value);
                    this.loadMoreProblems(this.state.value);
                    this.loadMorePredicates(this.state.value);
                }
            );
        }
    };

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    loadMoreResources = searchQuery => {
        if (searchQuery.length === 0) {
            return;
        }
        this.setState({ isResourcesNextPageLoading: true });
        getAllResources({
            page: this.state.resourcesPage,
            items: this.itemsPerFilter,
            sortBy: 'id',
            desc: true,
            q: searchQuery,
            exclude:
                process.env.REACT_APP_CLASSES_CONTRIBUTION + ',' + process.env.REACT_APP_CLASSES_PAPER + ',' + process.env.REACT_APP_CLASSES_PROBLEM
        }).then(resources => {
            if (resources.length > 0) {
                this.setState({
                    resources: [...this.state.resources, ...resources],
                    isResourcesNextPageLoading: false,
                    hasResourcesNextPage: resources.length < this.itemsPerFilter ? false : true,
                    resourcesPage: this.state.resourcesPage + 1
                });
            } else {
                this.setState({
                    isResourcesNextPageLoading: false,
                    hasResourcesNextPage: false,
                    isResourcesLastPageReached: true
                });
            }
        });
    };

    loadMorePapers = searchQuery => {
        if (searchQuery.length === 0) {
            return;
        }
        this.setState({ isPapersNextPageLoading: true });
        getResourcesByClass({
            page: this.state.papersPage,
            items: this.itemsPerFilter,
            sortBy: 'id',
            desc: true,
            q: searchQuery,
            id: process.env.REACT_APP_CLASSES_PAPER
        }).then(papers => {
            if (papers.length > 0) {
                this.setState({
                    papers: [...this.state.papers, ...papers],
                    isPapersNextPageLoading: false,
                    hasPapersNextPage: papers.length < this.itemsPerFilter ? false : true,
                    papersPage: this.state.papersPage + 1
                });
            } else {
                this.setState({
                    isPapersNextPageLoading: false,
                    hasPapersNextPage: false,
                    isPapersLastPageReached: true
                });
            }
        });
    };

    loadMoreProblems = searchQuery => {
        if (searchQuery.length === 0) {
            return;
        }
        this.setState({ isProblemsNextPageLoading: true });
        getResourcesByClass({
            page: this.state.problemsPage,
            items: this.itemsPerFilter,
            sortBy: 'id',
            desc: true,
            q: searchQuery,
            id: process.env.REACT_APP_CLASSES_PROBLEM
        }).then(problems => {
            if (problems.length > 0) {
                this.setState({
                    problems: [...this.state.problems, ...problems],
                    isProblemsNextPageLoading: false,
                    hasProblemsNextPage: problems.length < this.itemsPerFilter ? false : true,
                    problemsPage: this.state.problemsPage + 1
                });
            } else {
                this.setState({
                    isProblemsNextPageLoading: false,
                    hasProblemsNextPage: false,
                    isProblemsLastPageReached: true
                });
            }
        });
    };

    loadMorePredicates = searchQuery => {
        if (searchQuery.length === 0) {
            return;
        }
        this.setState({ isPredicatesNextPageLoading: true });
        getAllPredicates({
            page: this.state.predicatesPage,
            items: this.itemsPerFilter,
            sortBy: 'id',
            desc: true,
            q: searchQuery
        }).then(predicates => {
            if (predicates.length > 0) {
                this.setState({
                    predicates: [...this.state.predicates, ...predicates],
                    isPredicatesNextPageLoading: false,
                    hasPredicatesNextPage: predicates.length < this.itemsPerFilter ? false : true,
                    predicatesPage: this.state.predicatesPage + 1
                });
            } else {
                this.setState({
                    isPredicatesNextPageLoading: false,
                    hasPredicatesNextPage: false,
                    isPredicatesLastPageReached: true
                });
            }
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
                            <div className="box mr-4 p-4 h-100">
                                <Filters
                                    loading={this.state.loading}
                                    value={this.state.value}
                                    filters={this.filters}
                                    selectedFilters={this.state.selectedFilters}
                                    handleInputChange={this.handleInputChange}
                                    toggleFilter={this.toggleFilter}
                                />
                            </div>
                        </Col>
                        <Col className="col-sm-8 px-0">
                            <div className="box p-4 h-100">
                                {(this.state.selectedFilters.length === 0 ||
                                    (this.state.selectedFilters.length > 0 && this.state.selectedFilters.includes(1))) && (
                                    <Results
                                        loading={this.state.isPapersNextPageLoading}
                                        hasNextPage={this.state.hasPapersNextPage}
                                        loadMore={this.loadMorePapers}
                                        items={this.state.papers}
                                        label={'Papers'}
                                        class={process.env.REACT_APP_CLASSES_PAPER}
                                    />
                                )}
                                {(this.state.selectedFilters.length === 0 ||
                                    (this.state.selectedFilters.length > 0 && this.state.selectedFilters.includes(2))) && (
                                    <Results
                                        loading={this.state.isProblemsNextPageLoading}
                                        hasNextPage={this.state.hasProblemsNextPage}
                                        loadMore={this.loadMoreProblems}
                                        items={this.state.problems}
                                        label={'Research problems'}
                                        class={process.env.REACT_APP_CLASSES_PROBLEM}
                                    />
                                )}
                                {(this.state.selectedFilters.length === 0 ||
                                    (this.state.selectedFilters.length > 0 && this.state.selectedFilters.includes(3))) && (
                                    <Results
                                        loading={this.state.isResourcesNextPageLoading}
                                        hasNextPage={this.state.hasResourcesNextPage}
                                        loadMore={this.loadMoreResources}
                                        items={this.state.resources}
                                        label={'Resources'}
                                        class={'resource'}
                                    />
                                )}
                                {(this.state.selectedFilters.length === 0 ||
                                    (this.state.selectedFilters.length > 0 && this.state.selectedFilters.includes(4))) && (
                                    <Results
                                        loading={this.state.isPredicatesNextPageLoading}
                                        hasNextPage={this.state.hasPredicatesNextPage}
                                        loadMore={this.loadMorePredicates}
                                        items={this.state.predicates}
                                        label={'Predicates'}
                                        class={'predicate'}
                                    />
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
