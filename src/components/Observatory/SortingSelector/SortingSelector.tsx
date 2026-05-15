import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import { parseAsString, useQueryStates } from 'nuqs';
import { FC } from 'react';

import { SortByOptions } from '@/services/backend/types';

type SortingSelectorProps = {
    isLoading: boolean;
    defaultSortBy?: SortByOptions;
    defaultSortDirection?: string;
};

const SORTING_OPTIONS: { [key: string]: string } = {
    NAME_ASC: 'name_asc',
    NAME_DESC: 'name_desc',
} as const;

const SortingSelector: FC<SortingSelectorProps> = ({ isLoading, defaultSortBy = 'name', defaultSortDirection = 'asc' }) => {
    const [sort, setSort] = useQueryStates(
        {
            sortBy: parseAsString.withDefault(defaultSortBy),
            sortDirection: parseAsString.withDefault(defaultSortDirection),
        },
        {
            history: 'push',
            scroll: false,
        },
    );

    const handleChangeSort = (v: string) => {
        const values = v.split('_');
        setSort({ sortBy: values[0], sortDirection: values[1] });
    };

    const currentSort = `${sort.sortBy}_${sort.sortDirection}`;

    return (
        <Dropdown>
            <Button size="sm" className="button--orkg-secondary" isDisabled={isLoading}>
                Sort by: {currentSort === SORTING_OPTIONS.NAME_ASC && 'Name A-Z'}
                {currentSort === SORTING_OPTIONS.NAME_DESC && 'Name Z-A'}
                <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
            </Button>
            <Dropdown.Popover>
                <Dropdown.Menu onAction={(key) => handleChangeSort(key as string)}>
                    <Dropdown.Item id={SORTING_OPTIONS.NAME_ASC} textValue="Name A-Z">
                        Name A-Z
                    </Dropdown.Item>
                    <Dropdown.Item id={SORTING_OPTIONS.NAME_DESC} textValue="Name Z-A">
                        Name Z-A
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default SortingSelector;
