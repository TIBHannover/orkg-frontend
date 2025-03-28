import { useQueryState } from 'nuqs';
import { ChangeEvent, FC } from 'react';
import { Input } from 'reactstrap';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { VisibilityOptions } from '@/services/backend/types';

type ContentTypeVisibilityFilterProps = {
    isLoading: boolean;
};

const ContentTypeVisibilityFilter: FC<ContentTypeVisibilityFilterProps> = ({ isLoading }) => {
    const [sort, setSort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const handleChangeVisibility = (e: ChangeEvent<HTMLInputElement>) => {
        setSort(e.target.value as VisibilityOptions, { scroll: false, history: 'push' });
    };

    return (
        <div className="d-flex justify-content-end align-items-center me-2">
            <div className="mb-0">
                <Input defaultValue={sort} onChange={handleChangeVisibility} bsSize="sm" type="select" name="sort" disabled={isLoading}>
                    <option value={VISIBILITY_FILTERS.TOP_RECENT}>Top recent</option>
                    <option value={VISIBILITY_FILTERS.ALL_LISTED}>Recently added</option>
                    <option value={VISIBILITY_FILTERS.FEATURED}>Featured</option>
                    <option value={VISIBILITY_FILTERS.UNLISTED}>Unlisted</option>
                </Input>
            </div>
        </div>
    );
};

export default ContentTypeVisibilityFilter;
