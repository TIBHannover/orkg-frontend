import { Dispatch, FC, SetStateAction } from 'react';

import DateFilter from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/DateFilter/DateFilter';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import NumberFilter from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/NumberFilter/NumberFilter';
import TextCategoryFilter from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/TextCategoryFilter/TextCategoryFilter';

type FiltersProps = {
    predicateId: string;
    path: string[];
    setIsOpenFilterPopover: Dispatch<SetStateAction<boolean>>;
};

const Filters: FC<FiltersProps> = ({ predicateId, path, setIsOpenFilterPopover }) => {
    const { getType } = useFilters();
    const type = getType({ id: predicateId, path });

    return (
        <div className="tw:text-body tw:min-w-72 tw:py-2">
            {type === 'date' && <DateFilter predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />}
            {type === 'number' && <NumberFilter predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />}
            {(type === 'text' || type === 'category') && (
                <TextCategoryFilter predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} type={type} />
            )}
        </div>
    );
};

export default Filters;
