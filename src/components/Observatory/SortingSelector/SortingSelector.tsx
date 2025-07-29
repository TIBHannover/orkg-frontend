import { parseAsString, useQueryStates } from 'nuqs';
import { FC } from 'react';
import { UncontrolledButtonDropdown } from 'reactstrap';

import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
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
        <UncontrolledButtonDropdown size="sm" style={{ marginRight: 2 }} disabled={isLoading}>
            <DropdownToggle caret color="secondary">
                Sort by: {currentSort === SORTING_OPTIONS.NAME_ASC && 'Name A-Z'}
                {currentSort === SORTING_OPTIONS.NAME_DESC && 'Name Z-A'}
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem onClick={() => handleChangeSort(SORTING_OPTIONS.NAME_ASC)}>Name A-Z</DropdownItem>
                <DropdownItem onClick={() => handleChangeSort(SORTING_OPTIONS.NAME_DESC)}>Name Z-A</DropdownItem>
            </DropdownMenu>
        </UncontrolledButtonDropdown>
    );
};

export default SortingSelector;
