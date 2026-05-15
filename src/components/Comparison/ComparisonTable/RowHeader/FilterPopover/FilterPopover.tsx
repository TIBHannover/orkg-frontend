import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover } from '@heroui/react';
import { FC, useState } from 'react';

import Filters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/Filters';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';

type FilterPopoverProps = {
    id: string;
    path: string[];
};

const FilterPopover: FC<FilterPopoverProps> = ({ id, path }) => {
    const [isOpenFilterPopover, setIsOpenFilterPopover] = useState(false);

    const { getFilter } = useFilters();
    const hasFilter = getFilter({ id, path });

    return (
        <Popover isOpen={isOpenFilterPopover} onOpenChange={setIsOpenFilterPopover}>
            <Button
                isIconOnly
                variant="ghost"
                size="sm"
                aria-label="Filter column"
                className={`min-w-0 h-auto w-auto p-0 bg-transparent hover:bg-transparent opacity-70 hover:opacity-100 ${
                    hasFilter ? 'text-accent' : 'text-secondary'
                }`}
            >
                <FontAwesomeIcon icon={faFilter} />
            </Button>
            <Popover.Content placement="right">
                <Popover.Dialog>
                    <Popover.Arrow />
                    <Filters predicateId={id} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
};

export default FilterPopover;
