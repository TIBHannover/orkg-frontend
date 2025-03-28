import { FC } from 'react';
import useSWR from 'swr';

import FilterPath from '@/components/Filters/FilterInputField/FilterPath/FilterPath';
import { getPredicate, predicatesUrl } from '@/services/backend/predicates';
import { FilterConfig } from '@/services/backend/types';

type FilterLabelProps = {
    filter: FilterConfig;
};

const FilterLabel: FC<FilterLabelProps> = ({ filter }) => {
    let predicateId = null;
    if (!filter?.label && filter.path?.length > 0) {
        predicateId = filter.path[filter.path.length - 1];
    }
    const { data: predicate, isLoading } = useSWR(predicateId ? [predicateId, predicatesUrl, 'getPredicate'] : null, ([params]) =>
        getPredicate(params),
    );

    if (filter?.label) {
        return (
            <span className="me-1">
                {filter?.label} <FilterPath filter={filter} />
            </span>
        );
    }
    return !isLoading ? predicate?.label : 'Loading';
};

export default FilterLabel;
