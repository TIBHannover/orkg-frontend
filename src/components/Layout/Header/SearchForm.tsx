import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isString } from 'lodash';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { Form, Input, InputGroup } from 'reactstrap';
import styled from 'styled-components';

import Button from '@/components/Ui/Button/Button';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { getThing } from '@/services/backend/things';
import { getLinkByEntityType } from '@/utils';

const InputStyled = styled(Input)`
    max-width: 130px;
    width: 100%;
    transition: max-width 0.3s ease-in-out;

    &:focus {
        max-width: 250px;
    }
`;

type SearchFormProps = {
    placeholder: string;
    onSearch?: () => void;
};

const SearchForm: FC<SearchFormProps> = ({ placeholder, onSearch = undefined }) => {
    const [searchTerm] = useQueryState('q', { defaultValue: '' });
    const [type] = useQueryState('type', { defaultValue: '' });
    const [createdBy] = useQueryState('createdBy', { defaultValue: '' });

    const [value, setValue] = useState('');

    const router = useRouter();

    useEffect(() => {
        setValue(searchTerm || '');
    }, [searchTerm]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let route = '';
        if (isString(value) && value.length >= REGEX.MINIMUM_LENGTH_PATTERN && value.startsWith('#')) {
            const id = value.substring(1);
            const entity = await getThing(id);
            const link = getLinkByEntityType(entity?._class, id);
            setValue('');
            router.push(link);
        } else if (isString(value)) {
            route = `${reverse(ROUTES.SEARCH)}?q=${encodeURIComponent(value)}&type=${type}&createdBy=${createdBy}`;
        }
        onSearch?.();

        return route ? router.push(route) : null;
    };

    return (
        <Form className="mt-2 mt-md-0 mx-2 search-box mb-2 mb-md-0" onSubmit={handleSubmit} id="tour-search-bar">
            <InputGroup className="flex-nowrap">
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

export default SearchForm;
