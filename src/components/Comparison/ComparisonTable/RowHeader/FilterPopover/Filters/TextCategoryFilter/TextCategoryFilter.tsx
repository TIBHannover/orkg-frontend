import { Dispatch, FC, FormEvent, SetStateAction, useEffect, useId, useMemo, useState } from 'react';
import Select, { MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import stopwords from 'stopwords-en';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import Footer from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/Footer/Footer';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';

type TextCategoryFilterProps = {
    predicateId: string;
    path: string[];
    type: 'category' | 'text';
    setIsOpenFilterPopover: Dispatch<SetStateAction<boolean>>;
};

const TextCategoryFilter: FC<TextCategoryFilterProps> = ({ predicateId, path, setIsOpenFilterPopover, type }) => {
    const [selectedValues, setSelectedValues] = useState<MultiValue<{ label: string; count?: number }> | null>(null);

    const formId = useId();
    const { addFilter, getFilter, getUniqueValues } = useFilters();

    const uniqueValues = useMemo(() => getUniqueValues({ id: predicateId, path }), [getUniqueValues, path, predicateId]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (selectedValues && selectedValues.length > 0) {
            addFilter({
                id: predicateId,
                path,
                type,
                filterValues: {
                    ...(selectedValues && selectedValues.length > 0 && { values: selectedValues.map((v) => v.label) }),
                },
            });
            setIsOpenFilterPopover(false);
        } else {
            toast.error('Please provide at least one filter value.');
        }
    };

    const keywords = useMemo(
        () =>
            [
                ...new Set(
                    uniqueValues
                        .map((value) => value.label)
                        .join(' ')
                        .replace(/[.,/#!$%^&*;:{}=_`~()0-9]+/g, ' ')
                        .toLowerCase()
                        .split(' '),
                ),
            ]
                .filter((val) => val.length > 1 && !stopwords.includes(val))
                .map((val) => ({ label: val })),
        [uniqueValues],
    );

    useEffect(() => {
        const currentFilter = getFilter({ id: predicateId, path });

        if (!currentFilter) {
            return;
        }
        if (type === 'category') {
            const selected = uniqueValues.filter((v) => currentFilter.filterValues.values?.includes(v.label));
            setSelectedValues(selected);
        } else if (type === 'text') {
            const selected = keywords.filter((v) => currentFilter.filterValues.values?.includes(v.label));
            setSelectedValues(selected);
        }
    }, [getFilter, keywords, path, predicateId, type, uniqueValues]);

    return (
        <form onSubmit={handleSubmit}>
            <Select
                value={selectedValues}
                options={type === 'text' ? keywords : uniqueValues}
                onChange={setSelectedValues}
                getOptionValue={(item) => item?.label}
                getOptionLabel={(item) => `${item?.label} ${item?.count ? `(${item.count})` : ''}`}
                inputId={`${formId}-values`}
                isClearable={false}
                classNamePrefix="react-select"
                isSearchable
                isMulti
                className="tw:max-w-72"
            />

            <Footer predicateId={predicateId} path={path} setIsOpenFilterPopover={setIsOpenFilterPopover} />
            <SelectGlobalStyle />
        </form>
    );
};

export default TextCategoryFilter;
