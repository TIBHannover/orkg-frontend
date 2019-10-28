import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { submitGetRequest, url } from '../../network';
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
                    label: 'Resource',
                    class: 'resource'
                }
            ],
            [
                3,
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
            papers: [],
            loading: false,
        }
    }

    componentDidMount() {
        document.title = 'Search - ORKG';
        this.searchResources(this.state.value);
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.match.params.searchTerm !== prevProps.match.params.searchTerm) {
            this.setState({
                value: this.props.match.params.searchTerm,
            })
            this.searchResources(this.props.match.params.searchTerm);
        }
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    searchResources = async (searchQuery) => {
        if (searchQuery.length === 0) {
            return;
        }

        this.setState({
            loading: true,
        });

        let resources = await submitGetRequest(`${url}resources/?q=${searchQuery}`);

        // add resource class when there is no class for a resource
        resources.forEach((resource, index) => {
            resources[index].classes = resources[index].classes.length > 0 ? resources[index].classes : ['resource'];
        });

        const predicates = await submitGetRequest(`${url}predicates/?q=${searchQuery}`);

        // add resource class when there is no class for a resource
        predicates.forEach((predicate, index) => {
            predicates[index].classes = ['predicate'];
        });

        resources = resources.concat(predicates);

        this.setState({
            loading: false,
            resources
        });
    }

    toggleFilter = (filterClass) => {
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
    }

    countFilteredResources = (filterClass) => {
        return this.state.resources.filter((resource) => resource.classes.includes(filterClass)).length;
    }

    countResources = () => {
        let count = 0;

        if (this.state.selectedFilters.length > 0) {
            // count only the resources within the filters
            count = this.state.selectedFilters.reduce((previous, currentValue) => {
                return previous + this.countFilteredResources(this.filters.get(currentValue).class)
            }, 0);
        } else {
            count = this.state.resources.length;
        }

        return count;
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

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
    }

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
                                    countFilteredResources={this.countFilteredResources}
                                    filters={this.filters}
                                    selectedFilters={this.state.selectedFilters}
                                    resources={this.state.resources}
                                    handleInputChange={this.handleInputChange}
                                    toggleFilter={this.toggleFilter}
                                />
                            </div>
                        </Col>
                        <Col className="col-sm-8 px-0">
                            <div className="box p-4 h-100">
                                <Results
                                    loading={this.state.loading}
                                    countResources={this.countResources}
                                    countFilteredResources={this.countFilteredResources}
                                    filters={this.filters}
                                    selectedFilters={this.state.selectedFilters}
                                    resources={this.state.resources}
                                />
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
            searchTerm: PropTypes.string,
        }).isRequired,
    }).isRequired,
}

export default withRouter(Search);
