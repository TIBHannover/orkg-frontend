import { Input, Label, toast } from '@heroui/react';
import { isNumber } from 'lodash';
import { Dispatch, FC, FormEvent, SetStateAction, useEffect, useId, useState } from 'react';

import Footer from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/Footer/Footer';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';

type NumberFilterProps = {
    predicateId: string;
    path: string[];
    setIsOpenFilterPopover: Dispatch<SetStateAction<boolean>>;
};

const NumberFilter: FC<NumberFilterProps> = ({ predicateId, path, setIsOpenFilterPopover }) => {
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');

    const formId = useId();
    const { addFilter, getFilter } = useFilters();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (minValue || maxValue) {
            addFilter({
                id: predicateId,
                path,
                type: 'number',
                filterValues: {
                    ...(minValue && { minValue: parseFloat(minValue) }),
                    ...(maxValue && { maxValue: parseFloat(maxValue) }),
                },
            });
            setIsOpenFilterPopover(false);
        } else {
            toast.danger('Please provide at least one filter value.');
        }
    };

    useEffect(() => {
        const currentFilter = getFilter({ id: predicateId, path });

        if (!currentFilter) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMinValue(isNumber(currentFilter.filterValues.minValue) ? currentFilter.filterValues.minValue.toString() : '');
        setMaxValue(isNumber(currentFilter.filterValues.maxValue) ? currentFilter.filterValues.maxValue.toString() : '');
    }, [getFilter, path, predicateId]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                    <Label htmlFor={`${formId}-minimum`}>Minimum</Label>
                    <Input
                        id={`${formId}-minimum`}
                        type="number"
                        placeholder="Minimum"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                        fullWidth
                    />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                    <Label htmlFor={`${formId}-maximum`}>Maximum</Label>
                    <Input
                        id={`${formId}-maximum`}
                        type="number"
                        placeholder="Maximum"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                        fullWidth
                    />
                </div>
            </div>
            <Footer predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />
        </form>
    );
};

export default NumberFilter;
