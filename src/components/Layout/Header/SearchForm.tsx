'use client';

import { SearchField } from '@heroui/react';
import { isString } from 'lodash';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { FC, useState } from 'react';

import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getThing } from '@/services/backend/things';
import { getLinkByEntityType } from '@/utils';

type SearchFormProps = {
    placeholder: string;
    onSearch?: () => void;
};

const SearchForm: FC<SearchFormProps> = ({ placeholder, onSearch = undefined }) => {
    const [searchTerm] = useQueryState('q', { defaultValue: '' });
    const [type] = useQueryState('type', { defaultValue: '' });
    const [createdBy] = useQueryState('createdBy', { defaultValue: '' });

    const [value, setValue] = useState(searchTerm || '');
    const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
    if (searchTerm !== prevSearchTerm) {
        setPrevSearchTerm(searchTerm);
        setValue(searchTerm || '');
    }

    const router = useRouter();

    const handleSubmit = async (submittedValue: string) => {
        if (isString(submittedValue) && submittedValue.length >= REGEX.MINIMUM_LENGTH_PATTERN && submittedValue.startsWith('#')) {
            const id = submittedValue.substring(1);
            const entity = await getThing(id);
            const link = getLinkByEntityType(entity?._class, id);
            setValue('');
            router.push(link);
        } else if (isString(submittedValue)) {
            const route = `${reverse(ROUTES.SEARCH)}?q=${encodeURIComponent(submittedValue)}&type=${type}&createdBy=${createdBy}`;
            router.push(route);
        }
        onSearch?.();
    };

    return (
        <SearchField
            aria-label="Search ORKG"
            id="tour-search-bar"
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            maxLength={MAX_LENGTH_INPUT}
        >
            <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder={placeholder} className="w-[130px] focus:w-[180px] transition-[width] duration-300 ease-in-out" />
                <SearchField.ClearButton />
            </SearchField.Group>
        </SearchField>
    );
};

export default SearchForm;
