import { Button } from '@heroui/react';
import { Dispatch, FC, SetStateAction } from 'react';

import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';

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
        <div className="flex justify-between mt-3">
            <Button size="sm" variant="tertiary" onPress={handleReset} isDisabled={!filter}>
                Reset
            </Button>
            <Button size="sm" type="submit">
                Apply
            </Button>
        </div>
    );
};

export default Footer;
