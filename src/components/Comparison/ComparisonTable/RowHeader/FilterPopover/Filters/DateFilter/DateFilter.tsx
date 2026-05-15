import { Input, Label, toast } from '@heroui/react';
import { Dispatch, FC, FormEvent, SetStateAction, useEffect, useId, useState } from 'react';

import Footer from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/Footer/Footer';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';

type DateFilterProps = {
    predicateId: string;
    path: string[];
    setIsOpenFilterPopover: Dispatch<SetStateAction<boolean>>;
};

const DateFilter: FC<DateFilterProps> = ({ predicateId, path, setIsOpenFilterPopover }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const formId = useId();
    const { addFilter, getFilter } = useFilters();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (startDate || endDate) {
            addFilter({
                id: predicateId,
                path,
                type: 'date',
                filterValues: {
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
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
        setStartDate(currentFilter.filterValues.startDate ?? '');
        setEndDate(currentFilter.filterValues.endDate ?? '');
    }, [getFilter, path, predicateId]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                    <Label htmlFor={`${formId}-start`}>Start</Label>
                    <Input id={`${formId}-start`} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    <Label htmlFor={`${formId}-end`}>End</Label>
                    <Input id={`${formId}-end`} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth />
                </div>
            </div>

            <Footer predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />
        </form>
    );
};

export default DateFilter;
