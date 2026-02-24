import { Dispatch, FC, SetStateAction } from 'react';

import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import Button from '@/components/Ui/Button/Button';

type FooterProps = {
    predicateId: string;
    path: string[];
    setIsOpenFilterPopover: Dispatch<SetStateAction<boolean>>;
};

const Footer: FC<FooterProps> = ({ predicateId, path, setIsOpenFilterPopover }) => {
    const { removeFilter, getFilter } = useFilters();

    const filter = getFilter({ id: predicateId, path });

    const handleReset = () => {
        removeFilter({ id: predicateId, path });
        setIsOpenFilterPopover(false);
    };

    return (
        <div className="tw:flex tw:justify-between tw:mt-2">
            <Button size="sm" color="light" onClick={handleReset} disabled={!filter}>
                Reset
            </Button>
            <Button size="sm" color="primary" type="submit">
                Apply
            </Button>
        </div>
    );
};

export default Footer;
