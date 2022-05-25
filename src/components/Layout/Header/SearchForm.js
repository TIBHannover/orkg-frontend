import { useState, useEffect } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import REGEX from 'constants/regex';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Form, Input, Button, InputGroup } from 'reactstrap';
import { isString } from 'lodash';
import { getArrayParamFromQueryString, getParamFromQueryString, getLinkByEntityType, getEntityTypeByID } from 'utils';

const SearchForm = ({ placeholder, onSearch = null }) => {
    const [value, setValue] = useState('');
    const { searchTerm: urlSearchQuery } = useParams();
    const navigate = useNavigate();
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
        if (isString(value) && value.length >= REGEX.MINIMUM_LENGTH_PATTERN && getEntityTypeByID(value)) {
            const id = value.substring(1);
            setValue('');
            route = navigate(getLinkByEntityType(getEntityTypeByID(value), id));
        } else if (isString(value) && value) {
            const types = getArrayParamFromQueryString(location.search, 'types');
            const createdBy = getParamFromQueryString(location.search, 'createdBy');
            route = `${reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(value) })}?types=${`${
                types?.length > 0 ? types.join(',') : ''
            }`}&createdBy=${createdBy ?? ''}
                    `;
        }
        onSearch && onSearch();

        return route ? navigate(route) : null;
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
    onSearch: PropTypes.func,
};

export default SearchForm;
