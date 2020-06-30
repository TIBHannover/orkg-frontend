import React from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { CustomInput } from 'reactstrap';
import { Input, InputGroup, InputGroupAddon, Button, Form, Label } from 'reactstrap';
import ROUTES from '../../constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const Filters = props => {
    const handleSubmit = e => {
        props.history.push(reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(props.value) }) + '?types=' + props.selectedFilters.join(','));

        e.preventDefault();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Label for="searchQuery">Search query</Label>
            <InputGroup>
                <Input
                    value={decodeURIComponent(props.value)}
                    onChange={props.handleInputChange}
                    aria-label="Search ORKG"
                    id="searchQuery"
                    name="value"
                />

                <InputGroupAddon addonType="append">
                    <Button type="submit" color="secondary" className="pl-2 pr-2">
                        <FontAwesomeIcon icon={faSearch} />
                    </Button>
                </InputGroupAddon>
            </InputGroup>
            <hr className="mt-4 mb-3" />

            <Label>Type</Label>

            {Array.from(props.filters, ([key, filter]) => (
                <CustomInput
                    type="checkbox"
                    id={'filter' + filter.class}
                    key={`filter-${key}`}
                    label={<span>{filter.label}</span>}
                    onChange={() => props.toggleFilter(key)}
                    checked={props.selectedFilters.includes(key)}
                />
            ))}
        </Form>
    );
};

Filters.propTypes = {
    value: PropTypes.string.isRequired,
    filters: PropTypes.object,
    selectedFilters: PropTypes.array.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
};

export default withRouter(Filters);
