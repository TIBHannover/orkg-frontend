import { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { withRouter } from 'react-router-dom'; // to access the history object
import { reverse } from 'named-urls';
import dotProp from 'dot-prop-immutable';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';
import { getClassById, getClasses } from 'services/backend/classes';
import { getResources, getResourcesByClass } from 'services/backend/resources';
import { getPredicates } from 'services/backend/predicates';
import ROUTES from 'constants/routes';
import { PREDICATE_TYPE_ID, RESOURCE_TYPE_ID } from 'constants/misc';
import Results from 'components/Search/Results';
import Filters from 'components/Search/Filters';
import { getArrayParamFromQueryString } from 'utils';
import { unionBy } from 'lodash';
import { toast } from 'react-toastify';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { getPaperByDOI } from 'services/backend/misc';
import REGEX from 'constants/regex';
import TitleBar from 'components/TitleBar/TitleBar';

class Search extends Component {
    constructor(props) {
        super(props);

        const value = this.props.match.params.searchTerm;

        this.itemsPerFilter = 10;

        this.defaultsFilters = [
            {
                label: 'Author',
                labelPlural: 'Authors',
                id: CLASSES.AUTHOR
            },
            {
                label: 'Comparison',
                labelPlural: 'Comparisons',
                id: CLASSES.COMPARISON
            },
            {
                label: 'Paper',
                labelPlural: 'Papers',
                id: CLASSES.PAPER
            },
            {
                label: 'Property',
                labelPlural: 'Properties',
                id: PREDICATE_TYPE_ID
            },
            {
                label: 'Class',
                labelPlural: 'Classes',
                id: ENTITIES.CLASS
            },
            {
                label: 'Research Problem',
                labelPlural: 'Research Problems',
                id: CLASSES.PROBLEM
            },
            {
                label: 'Resource',
                labelPlural: 'Resources',
                id: RESOURCE_TYPE_ID
            },
            {
                label: 'Template',
                labelPlural: 'Templates',
                id: CLASSES.TEMPLATE
            },
            {
                label: 'Venue',
                labelPlural: 'Venues',
                id: CLASSES.VENUE
            },
            {
                label: 'Visualization',
                labelPlural: 'Visualizations',
                id: CLASSES.VISUALIZATION
            },
            {
                label: 'SmartReview',
                labelPlural: 'SmartReviews',
                id: CLASSES.SMART_REVIEW_PUBLISHED
            }
        ];

        this.ignoredClasses = [CLASSES.CONTRIBUTION, CLASSES.CONTRIBUTION_DELETED, CLASSES.PAPER_DELETED];

        const selectedFiltersStrings = getArrayParamFromQueryString(decodeURIComponent(this.props.location.search), 'types');
        // ensure the array format is accepted by the autocomplete component
        const selectedFilters = selectedFiltersStrings.map(filter => ({ id: filter }));

        let results;
        if (selectedFilters && selectedFilters.length > 0) {
            results = { ...selectedFilters.map(f => ({ [f]: [] })) };
        } else {
            results = { ...this.defaultsFilters.map(f => ({ [f.id]: [] })) };
        }

        this.state = {
            value,
            selectedFilters: selectedFilters ? selectedFilters : this.defaultsFilters,
            results,
            isNextPageLoading: {},
            loadingFilterClasses: true,
            hasNextPage: {},
            currentPage: {},
            isLastPageReached: {}
        };
    }

    componentDidMount() {
        document.title = 'Search - ORKG';
        this.getResultsForFilters();
    }

    componentDidUpdate = (prevProps, prevState) => {
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
                    this.getResultsForFilters();
                }
            );
        }
    };

    getResultsForFilters = () => {
        this.setState({ loadingFilterClasses: true });
        const selectedFilters = getArrayParamFromQueryString(decodeURIComponent(this.props.location.search), 'types');
        if (!selectedFilters || selectedFilters.length === 0) {
            this.setState({ loadingFilterClasses: false });
            for (const filter of this.defaultsFilters) {
                if (!this.state.results[filter.id]) {
                    this.loadMoreResults(this.state.value, filter.id);
                }
            }
        } else {
            const classesCalls = selectedFilters.map(classID => {
                if (this.defaultsFilters.map(df => df.id).includes(classID)) {
                    return this.defaultsFilters.find(df => df.id === classID);
                }
                return getClassById(classID);
            });
            return Promise.all(classesCalls).then(classes => {
                this.setState({ loadingFilterClasses: false, selectedFilters: classes }, () => {
                    for (const filter of selectedFilters) {
                        if (!this.state.results[filter]) {
                            this.loadMoreResults(this.state.value, filter);
                        }
                    }
                });
            });
        }
    };

    isLoading = () => {
        return Object.keys(this.state.isNextPageLoading).some(v => this.state.isNextPageLoading[v] === true) || this.state.loadingFilterClasses;
    };

    loadMoreResults = async (searchQuery, filterType) => {
        if (!searchQuery || searchQuery.length === 0) {
            return;
        }
        searchQuery = decodeURIComponent(searchQuery);
        this.setState({ isNextPageLoading: { ...this.state.isNextPageLoading, [filterType]: true } });

        let results = [];

        try {
            if (filterType === PREDICATE_TYPE_ID) {
                results = await getPredicates({
                    page: this.state.currentPage[PREDICATE_TYPE_ID] || 0,
                    items: this.itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    returnContent: true
                });
            } else if (filterType === RESOURCE_TYPE_ID) {
                results = await getResources({
                    page: this.state.currentPage[RESOURCE_TYPE_ID] || 0,
                    items: this.itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    exclude: this.defaultsFilters
                        .map(df => df.id)
                        .concat(this.ignoredClasses)
                        .join(','),
                    returnContent: true
                });
            } else if (filterType === ENTITIES.CLASS) {
                results = await getClasses({
                    page: this.state.currentPage[ENTITIES.CLASS] || 0,
                    items: this.itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    returnContent: true
                });
            } else {
                results = await getResourcesByClass({
                    page: this.state.currentPage[filterType] || 0,
                    items: this.itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    id: filterType,
                    returnContent: true
                });
            }

            // for papers, try to find a DOI
            if (filterType === CLASSES.PAPER && REGEX.DOI.test(searchQuery)) {
                try {
                    const paper = await getPaperByDOI(searchQuery);
                    results.push({ label: paper.title, id: paper.id, class: CLASSES.PAPER });
                } catch (e) {}
            }
        } catch (e) {
            toast.error('Something went wrong while loading search results.');
        }

        if (results.length > 0) {
            this.setState(state => {
                state.results[filterType] = [...(state.results[filterType] || []), ...results];
                state.isNextPageLoading[filterType] = false;
                state.hasNextPage[filterType] = results.length < this.itemsPerFilter ? false : true;
                state.currentPage[filterType] = (state.currentPage[filterType] || 0) + 1;
                return state;
            });
        } else {
            this.setState(state => {
                state.isNextPageLoading[filterType] = false;
                state.hasNextPage[filterType] = false;
                state.isLastPageReached[filterType] = true;
                return state;
            });
        }
    };

    toggleFilter = async filterClass => {
        // if current filters are empty and filters should be applied, don't do anything
        if (!this.state.selectedFilters.length && !filterClass) {
            return;
        }

        let selectedFilters = [];

        if (filterClass === null) {
            selectedFilters = this.state.selectedFilters.filter(s => this.defaultsFilters.map(df => df.id).includes(s.id));
        } else {
            if (this.state.selectedFilters.map(sf => sf.id).includes(filterClass.id)) {
                // remove the filter
                const index = this.state.selectedFilters.map(sf => sf.id).indexOf(filterClass.id);
                selectedFilters = dotProp.delete(this.state.selectedFilters, index);
            } else {
                selectedFilters = [...this.state.selectedFilters, filterClass];
            }
        }

        await this.props.history.push(
            reverse(ROUTES.SEARCH, { searchTerm: this.state.value }) + '?types=' + selectedFilters.map(sf => sf.id).join(',')
        );

        this.setState({
            selectedFilters
        });
        this.getResultsForFilters();
    };

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        const allFilters = unionBy(this.defaultsFilters, this.state.selectedFilters, 'id');
        return (
            <div>
                <TitleBar>Search results</TitleBar>
                <Container>
                    <Row>
                        <Col className="col-sm-4 px-0">
                            <div className="box rounded mr-4 p-4 h-100">
                                <Filters
                                    loading={this.isLoading()}
                                    value={this.state.value || ''}
                                    defaultsFilters={this.defaultsFilters}
                                    selectedFilters={this.state.selectedFilters}
                                    handleInputChange={this.handleInputChange}
                                    toggleFilter={this.toggleFilter}
                                />
                            </div>
                        </Col>
                        <Col className="col-sm-8 px-0">
                            <div className="box rounded p-4">
                                {this.isLoading() &&
                                    Object.keys(this.state.results).every(v => this.state.results[v] && this.state.results[v].length === 0) && (
                                        <ContentLoader
                                            height="100%"
                                            width="100%"
                                            viewBox="0 0 100 25"
                                            style={{ width: '100% !important' }}
                                            speed={2}
                                            backgroundColor="#f3f3f3"
                                            foregroundColor="#ecebeb"
                                        >
                                            <rect x="0" y="0" width="50" height="3" />
                                            <rect x="0" y="5" width="100%" height="3" />
                                            <rect x="0" y="10" width="100%" height="3" />
                                            <rect x="0" y="15" width="100%" height="3" />
                                            <rect x="0" y="20" width="100%" height="3" />
                                        </ContentLoader>
                                    )}

                                {!this.props.match.params.searchTerm ||
                                (!this.isLoading() &&
                                    Object.keys(this.state.results).every(v => this.state.results[v] && this.state.results[v].length === 0)) ? (
                                    <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
                                ) : (
                                    <div>
                                        {allFilters.map(filter => {
                                            if (
                                                this.state.selectedFilters.length === 0 ||
                                                (this.state.selectedFilters.length > 0 &&
                                                    this.state.selectedFilters.map(c => c && c.id).includes(filter.id))
                                            ) {
                                                return (
                                                    <div key={`filter-result${filter.id}`}>
                                                        <Results
                                                            loading={this.state.isNextPageLoading[filter.id] || false}
                                                            hasNextPage={this.state.hasNextPage[filter.id] || false}
                                                            loadMore={() => this.loadMoreResults(this.state.value, filter.id)}
                                                            items={this.state.results[filter.id] || []}
                                                            label={filter.label || filter.id}
                                                            class={filter.id}
                                                            showNoResultsMessage={this.state.selectedFilters.map(c => c.id).includes(filter.id)}
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
