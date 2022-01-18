import { useState, useEffect } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { useLocation } from 'react-router';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Form, Input, Button, InputGroup } from 'reactstrap';
import { isString } from 'lodash';
import { getArrayParamFromQueryString, getParamFromQueryString } from 'utils';

const SearchForm = ({ placeholder, onSearch = null }) => {
    const PROPERTY_PATTERN = /^#P([0-9])+$/;
    const RESOURCE_PATTERN = /^#R([0-9])+$/;
    const MINIMUM_LENGTH_PATTERN = 3;

    const [value, setValue] = useState('');
    const match = useRouteMatch(ROUTES.SEARCH);
    const urlSearchQuery = match?.params?.searchTerm;
    const history = useHistory();
    const location = useLocation();

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
            route = reverse(value.match(RESOURCE_PATTERN) ? ROUTES.RESOURCE : ROUTES.PROPERTY, { id });
        } else if (isString(value) && value) {
            const types = getArrayParamFromQueryString(location.search, 'types');
            const byMe = getParamFromQueryString(location.search, 'byMe', true);
            route = `${reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(value) })}?types=${`${
                types?.length > 0 ? types.join(',') : ''
            }`}&byMe=${byMe}
                    `;
        }
        onSearch && onSearch();

        return route ? history.push(route) : null;
    };

    return (
        <Form className="mt-2 mt-md-0 mx-2 search-box mb-2 mb-md-0" inline onSubmit={handleSubmit} style={{ minWidth: 57 }}>
            <InputGroup>
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    aria-label="Search ORKG"
                    aria-describedby="button-main-search"
                />

                <Button id="button-main-search" className="ps-2 pe-2 search-icon" type="submit">
                    <Icon icon={faSearch} />
                </Button>
            </InputGroup>
        </Form>
    );
};

SearchForm.propTypes = {
    placeholder: PropTypes.string.isRequired,
    onSearch: PropTypes.func
};

export default SearchForm;
