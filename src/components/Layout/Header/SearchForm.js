import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { isString } from 'lodash';
import { reverse } from 'named-urls';
import { useRouter, useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Button, Form, Input, InputGroup } from 'reactstrap';
import { getThing } from 'services/backend/things';
import styled from 'styled-components';
import { getLinkByEntityType } from 'utils';

const InputStyled = styled(Input)`
    max-width: 120px;
    width: 100%;
    transition: max-width 0.3s ease-in-out;

    &:focus {
        max-width: 250px;
    }
`;
const SearchForm = ({ placeholder, onSearch = null }) => {
    const [value, setValue] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSearchQuery = searchParams.get('q') || '';
    useEffect(() => {
        const decodedValue = isString(urlSearchQuery) ? decodeURIComponent(urlSearchQuery) : urlSearchQuery;
        setValue(decodedValue || '');
    }, [urlSearchQuery]);

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let route = '';
        if (isString(value) && value.length >= REGEX.MINIMUM_LENGTH_PATTERN && value.startsWith('#')) {
            const id = value.substring(1);
            const entity = await getThing(id);
            const link = getLinkByEntityType(entity?._class, id);
            setValue('');
            route = router.push(link);
        } else if (isString(value) && value) {
            const types = searchParams.get('types')?.split(',');
            const createdBy = searchParams.get('createdBy');
            route = `${reverse(ROUTES.SEARCH)}?q=${encodeURIComponent(value)}&types=${`${types?.length > 0 ? types.join(',') : ''}`}&createdBy=${
                createdBy ?? ''
            }
                    `;
        }
        onSearch && onSearch();

        return route ? router.push(route) : null;
    };

    return (
        <Form className="mt-2 mt-md-0 mx-2 search-box mb-2 mb-md-0" onSubmit={handleSubmit} id="tour-search-bar">
            <InputGroup>
                <InputStyled
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    aria-label="Search ORKG"
                    aria-describedby="button-main-search"
                    type="text"
                    maxLength={MAX_LENGTH_INPUT}
                />

                <Button id="button-main-search" className="ps-2 pe-2 search-icon" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
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
