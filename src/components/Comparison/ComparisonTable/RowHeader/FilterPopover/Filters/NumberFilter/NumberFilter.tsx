import { isNumber } from 'lodash';
import { Dispatch, FC, FormEvent, SetStateAction, useEffect, useId, useState } from 'react';
import { toast } from 'react-toastify';

import Footer from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/Footer/Footer';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';

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
            toast.error('Please provide at least one filter value.');
        }
    };

    useEffect(() => {
        const currentFilter = getFilter({ id: predicateId, path });

        if (!currentFilter) {
            return;
        }
        setMinValue(isNumber(currentFilter.filterValues.minValue) ? currentFilter.filterValues.minValue.toString() : '');
        setMaxValue(isNumber(currentFilter.filterValues.maxValue) ? currentFilter.filterValues.maxValue.toString() : '');
    }, [getFilter, path, predicateId]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="tw:flex tw:gap-2">
                <FormGroup floating className="tw:!mb-0">
                    <Input
                        id={`${formId}-minimum`}
                        placeholder="Minimum"
                        type="number"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                    />
                    <Label for={`${formId}-minimum`}>Minimum</Label>
                </FormGroup>

                <FormGroup floating className="tw:!mb-0">
                    <Input
                        id={`${formId}-maximum`}
                        type="number"
                        placeholder="Maximum"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                    />
                    <Label for={`${formId}-maximum`}>Maximum</Label>
                </FormGroup>
            </div>
            <Footer predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />
        </form>
    );
};

export default NumberFilter;
