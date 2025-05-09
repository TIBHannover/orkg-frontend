import { useQueryState } from 'nuqs';
import { FC } from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { VisibilityOptions } from '@/services/backend/types';

type VisibilityFilterProps = {
    defaultValue?: VisibilityOptions;
};

const VisibilityFilter: FC<VisibilityFilterProps> = ({ defaultValue = VISIBILITY_FILTERS.ALL_LISTED }) => {
    const [visibility, setVisibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue,
        parse: (value) => value as VisibilityOptions,
    });

    const handleChangeSort = (v: VisibilityOptions) => {
        setVisibility(v);
    };

    return (
        <UncontrolledButtonDropdown size="sm" style={{ marginRight: 2 }}>
            <DropdownToggle caret color="secondary">
                {visibility === VISIBILITY_FILTERS.ALL_LISTED && 'Recently added'}
                {visibility === VISIBILITY_FILTERS.FEATURED && 'Featured'}
                {visibility === VISIBILITY_FILTERS.UNLISTED && 'Unlisted'}
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem onClick={() => handleChangeSort(VISIBILITY_FILTERS.ALL_LISTED)}>Recently added</DropdownItem>
                <DropdownItem onClick={() => handleChangeSort(VISIBILITY_FILTERS.FEATURED)}>Featured</DropdownItem>
                <DropdownItem onClick={() => handleChangeSort(VISIBILITY_FILTERS.UNLISTED)}>Unlisted</DropdownItem>
            </DropdownMenu>
        </UncontrolledButtonDropdown>
    );
};

export default VisibilityFilter;
