import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Container, Row, Col, Input, InputGroup, InputGroupAddon, Button, Form, Label, ListGroup, ListGroupItem, Badge } from 'reactstrap';
import { CustomInput } from 'reactstrap';
import { submitGetRequest, url } from '../../network';
import ROUTES from '../../constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import dotProp from 'dot-prop-immutable';
import PropTypes from 'prop-types';
import queryString from 'query-string';

//loading indicator
class Search extends Component {

    constructor(props) {
        super(props);

        let value = '';
        if (this.props.location.pathname.includes('/search/')) {
            value = this.props.location.pathname.substring(this.props.location.pathname.lastIndexOf('/') + 1);
        }

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
        }

        this.searchResources();

    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    searchResources = async () => {
        this.setState({
            loading: true,
        });

        let resources = await submitGetRequest(`${url}resources/?q=${this.state.value}`);

        // add resource class when there is no class for a resource
        resources.forEach((resource, index) => {
            resources[index].classes = resources[index].classes.length > 0 ? resources[index].classes : ['resource'];
        });

        const predicates = await submitGetRequest(`${url}predicates/?q=${this.state.value}`);

        // add resource class when there is no class for a resource
        predicates.forEach((predicate, index) => {
            predicates[index].classes = ['predicate'];
        });
        console.log(predicates);

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

    filteredResults = (filterClass) => {
        return (
            <ListGroup className="mb-3">
                {this.state.resources.map((resource) => {
                    if (!resource.classes.includes(filterClass)) {
                        return <></>;
                    }

                    return (
                        <ListGroupItem action className="pt-1 pb-1">
                            <Link to={this.getResourceLink(filterClass, resource.id)}>
                                {resource.label}
                            </Link>
                        </ListGroupItem>
                    )
                })}
            </ListGroup>
        );
    }

    getResourceLink = (filterClass, resourceId) => {
        let link = '';

        switch (filterClass) {
            case process.env.REACT_APP_CLASSES_PAPER: {
                link = reverse(ROUTES.VIEW_PAPER, { resourceId: resourceId });
                break;
            }
            case 'resource': {
                link = '/resource/' + resourceId;
                break;
            }
            case 'predicate': {
                link = '/predicate/' + resourceId;
                break;
            }
            default: {
                link = '';
                break;
            }       
        }

        return link;
    }

    getFilterAmount = (filterClass) => {
        return this.state.resources.filter((resource) => resource.classes.includes(filterClass)).length;
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
                                <Form onSubmit={null}>
                                    <Label for="searchQuery">Search query</Label>
                                    <InputGroup>
                                        <Input
                                            value={this.state.value}
                                            onChange={this.handleInputChange}
                                            aria-label="Search ORKG"
                                            id="searchQuery"
                                            name="value"
                                        />

                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" className="pl-2 pr-2"><FontAwesomeIcon icon={faSearch} /></Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <hr className="mt-4 mb-3" />

                                    <Label>Type</Label>

                                    {Array.from(this.filters, ([key, filter]) => (
                                        <CustomInput
                                            type="checkbox"
                                            id={'filter' + filter.class}
                                            label={<span>{filter.label} <Badge color="light" className="pl-2 pr-2">{this.getFilterAmount(filter.class)}</Badge></span>}
                                            onChange={() => this.toggleFilter(key)}
                                            checked={this.state.selectedFilters.includes(key)}
                                        />
                                    )
                                    )}
                                </Form>
                            </div>
                        </Col>
                        <Col className="col-sm-8 px-0">
                            <div className="box p-4 h-100">
                                {Array.from(this.filters, ([key, filter]) => {
                                    if ((this.state.selectedFilters.length > 0 && !this.state.selectedFilters.includes(key)) || this.getFilterAmount(filter.class) === 0) {
                                        return <></>;
                                    }

                                    return (
                                        <div>
                                            <h2 className="h5">{filter.label}</h2>
                                            {this.filteredResults(filter.class)}
                                        </div>
                                    );
                                })}
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
}

export default withRouter(Search);
