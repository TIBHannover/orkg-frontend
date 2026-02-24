import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';

import Filters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/Filters';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import Popover from '@/components/FloatingUI/Popover';
import Button from '@/components/Ui/Button/Button';

type FilterPopoverProps = {
    id: string;
    path: string[];
};

const FilterPopover: FC<FilterPopoverProps> = ({ id, path }) => {
    const [isOpenFilterPopover, setIsOpenFilterPopover] = useState(false);

    const { getFilter } = useFilters();
    const hasFilter = getFilter({ id, path });

    return (
        <Popover
            open={isOpenFilterPopover}
            onOpenChange={setIsOpenFilterPopover}
            placement="right"
            content={<Filters predicateId={id} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />}
        >
            <span>
                <Button
                    color="link"
                    className={`tw:!p-0 ${hasFilter ? 'text-primary' : 'text-secondary'} tw:opacity-70 tw:!border-0`}
                    onClick={() => setIsOpenFilterPopover((v) => !v)}
                >
                    <FontAwesomeIcon icon={faFilter} />
                </Button>
            </span>
        </Popover>
    );
};

export default FilterPopover;
