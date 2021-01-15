import { useState, useEffect } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Form, Input, Button, InputGroup, InputGroupAddon } from 'reactstrap';
import { isString } from 'lodash';

const SearchForm = props => {
    const PROPERTY_PATTERN = /^#P([0-9])+$/;
    const RESOURCE_PATTERN = /^#R([0-9])+$/;
    const MINIMUM_LENGTH_PATTERN = 3;

    const [value, setValue] = useState('');
    const match = useRouteMatch(ROUTES.SEARCH);
    const urlSearchQuery = match?.params?.searchTerm;
    const history = useHistory();

    useEffect(() => {
        const decodedValue = isString(urlSearchQuery) ? decodeURIComponent(urlSearchQuery) : urlSearchQuery;
        setValue(decodedValue || '');
    }, [urlSearchQuery]);

    const handleChange = event => {
        setValue(event.target.value);
    };

    const handleSubmit = e => {
        e.preventDefault();

        let route = '';
        if (isString(value) && value.length >= MINIMUM_LENGTH_PATTERN && (value.match(RESOURCE_PATTERN) || value.match(PROPERTY_PATTERN))) {
            const id = value.substring(1);
            setValue('');
            route = reverse(value.match(RESOURCE_PATTERN) ? ROUTES.RESOURCE : ROUTES.PREDICATE, { id });
        } else {
            route = reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(value) });
        }
        return history.push(route);
    };

    return (
        <Form className="mt-2 mt-md-0 mr-3 search-box mb-2 mb-md-0" inline onSubmit={handleSubmit} style={{ minWidth: 57 }}>
            <InputGroup>
                <Input
                    placeholder={props.placeholder}
                    value={value}
                    onChange={handleChange}
                    aria-label="Search ORKG"
                    aria-describedby="button-main-search"
                />

                <InputGroupAddon addonType="append">
                    <Button id="button-main-search" className="pl-2 pr-2 search-icon" type="submit">
                        <Icon icon={faSearch} />
                    </Button>
                </InputGroupAddon>
            </InputGroup>
        </Form>
    );
};

SearchForm.propTypes = {
    placeholder: PropTypes.string.isRequired
};

export default SearchForm;
