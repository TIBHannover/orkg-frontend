import { Input } from '@heroui/react';
import { isString } from 'lodash';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import useSWR from 'swr';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import { OptionType } from '@/components/Autocomplete/types';
import NumberInputField from '@/components/Filters/FilterInputField/NumberInputField';
import { getConfigByClassId } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { getResourcesByIds, resourcesUrl } from '@/services/backend/resources';
import { FilterConfig, FilterConfigValue } from '@/services/backend/types';

type FilterInputFieldProps = {
    filter: FilterConfig;
    updateFilterValue: (_filter: FilterConfig, _value: FilterConfigValue[] | string) => void;
};

const NON_RESOURCE_CLASSES = [
    CLASSES.STRING,
    CLASSES.INTEGER,
    CLASSES.DECIMAL,
    CLASSES.BOOLEAN,
    CLASSES.RESOURCE,
    CLASSES.URI,
    CLASSES.CLASS,
    CLASSES.PREDICATE,
    CLASSES.DATE,
];

const BOOLEAN_OPTIONS = [
    { value: 'true', label: 'true' },
    { value: 'false', label: 'false' },
];

const FilterInputField: FC<FilterInputFieldProps> = ({ filter, updateFilterValue }) => {
    const shouldLoadResourcesData = !!(!NON_RESOURCE_CLASSES.includes(filter.range) && filter.values?.some((v) => isString(v.value)));

    const { data: resources, isLoading } = useSWR(
        shouldLoadResourcesData && filter.values ? [filter.values.map((v) => v.value?.toString()), resourcesUrl, 'getResourcesByIds'] : null,
        ([params]) => getResourcesByIds(params),
    );

    const [values, setValues] = useState<FilterConfigValue[]>(filter?.values ?? []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValues(filter?.values ?? []);
    }, [filter?.values]);

    if (isLoading) {
        return <span className="text-sm text-muted">Loading...</span>;
    }

    const updateValue = (next: FilterConfigValue[]) => {
        setValues(next);
        updateFilterValue(filter, next);
    };

    const config = getConfigByClassId(filter.range);
    let { inputFormType } = config;
    if (filter.range === CLASSES.STRING) inputFormType = 'text';
    if (filter.range === CLASSES.DECIMAL || filter.range === CLASSES.INTEGER) inputFormType = 'number';

    const convertFilterConfigValue2Resource = (filterConfigValue: FilterConfigValue) =>
        !isString(filterConfigValue.value) ? filterConfigValue.value : resources?.find((r) => r.id === filterConfigValue.value);

    const convertResource2FilterConfigValue = (value: OptionType) => ({ op: 'EQ', value });

    if (inputFormType === 'boolean') {
        return (
            <Select
                onChange={(selected) => {
                    updateValue(selected ? [{ op: 'EQ', value: selected.value }] : []);
                }}
                classNamePrefix="react-select"
                classNames={customClassNames as any}
                styles={customStyles as any}
                menuPosition="fixed"
                isClearable
                isSearchable={false}
                value={BOOLEAN_OPTIONS.find((o) => o.value === values?.[0]?.value) ?? null}
                options={BOOLEAN_OPTIONS}
            />
        );
    }

    if (inputFormType === 'autocomplete') {
        const autocompleteValue = (values
            ?.map((v) => convertFilterConfigValue2Resource(v))
            .filter((v) => !!v && typeof v === 'object' && 'id' in (v as object)) ?? []) as OptionType[];
        return (
            <Autocomplete
                entityType={ENTITIES.RESOURCE}
                baseClass={filter.range}
                placeholder="Select or type to enter a resource"
                onChange={(selected) =>
                    updateValue((selected as OptionType[])?.map((v) => convertResource2FilterConfigValue(v) as FilterConfigValue))
                }
                value={autocompleteValue}
                openMenuOnFocus
                isClearable
                enableExternalSources={false}
                isMulti
                allowCreate={false}
            />
        );
    }

    if (inputFormType === 'number') {
        return <NumberInputField filter={filter} updateValue={updateValue} />;
    }

    const currentValue = values?.[0]?.value;
    const stringValue = currentValue == null ? '' : String(currentValue);

    return (
        <Input
            placeholder="Enter a value"
            name="literalValue"
            type={inputFormType}
            value={stringValue}
            onChange={(e) => updateValue([{ op: 'EQ', value: e.target.value }])}
            className="grow"
            style={{ minWidth: '250px' }}
            autoFocus
        />
    );
};

export default FilterInputField;
