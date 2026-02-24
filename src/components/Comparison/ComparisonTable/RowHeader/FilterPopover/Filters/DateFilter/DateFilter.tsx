import { Dispatch, FC, FormEvent, SetStateAction, useEffect, useId, useState } from 'react';
import { toast } from 'react-toastify';

import Footer from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/Footer/Footer';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';

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
            toast.error('Please provide at least one filter value.');
        }
    };

    useEffect(() => {
        const currentFilter = getFilter({ id: predicateId, path });

        if (!currentFilter) {
            return;
        }
        setStartDate(currentFilter.filterValues.startDate ?? '');
        setEndDate(currentFilter.filterValues.endDate ?? '');
    }, [getFilter, path, predicateId]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="tw:flex tw:gap-2 tw:text-black tw:flex-row tw:!items-center">
                <FormGroup floating className="tw:!mb-0">
                    <Input
                        id={`${formId}-start`}
                        type="date"
                        placeholder="Start date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Label for={`${formId}-start`}>Start</Label>
                </FormGroup>
                <FormGroup floating className="tw:!mb-0">
                    <Input id={`${formId}-end`} type="date" placeholder="End date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <Label for={`${formId}-end`}>End</Label>
                </FormGroup>
            </div>

            <Footer predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />
        </form>
    );
};

export default DateFilter;
