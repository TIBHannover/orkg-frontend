import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { OptionType } from 'components/Autocomplete/types';
import NumberInputField from 'components/Filters/FilterInputField/NumberInputField';
import { getConfigByClassId } from 'constants/DataTypes';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { isString } from 'lodash';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { Input } from 'reactstrap';
import { getResourcesByIds, resourcesUrl } from 'services/backend/resources';
import { FilterConfig, FilterConfigValue } from 'services/backend/types';
import useSWR from 'swr';

type FilterInputFieldProps = {
    filter: FilterConfig;
    updateFilterValue: (_filter: FilterConfig, _value: FilterConfigValue[] | string) => void;
};

const FilterInputField: FC<FilterInputFieldProps> = ({ filter, updateFilterValue }) => {
    const notResource = [
        CLASSES.STRING,
        CLASSES.INTEGER,
        CLASSES.DECIMAL,
        CLASSES.BOOLEAN,
        CLASSES.STRING,
        CLASSES.RESOURCE,
        CLASSES.URI,
        CLASSES.CLASS,
        CLASSES.PREDICATE,
        CLASSES.DATE,
    ];

    const shouldLoadResourcesData = !notResource.includes(filter.range) && filter.values?.some((v) => isString(v.value));

    const { data: resources, isLoading } = useSWR(
        shouldLoadResourcesData && filter.values ? [filter.values.map((v) => v.value?.toString()), resourcesUrl, 'getResourcesByIds'] : null,
        ([params]) => getResourcesByIds(params),
    );

    const [values, setValues] = useState<FilterConfigValue[]>(filter?.values ?? []);

    useEffect(() => {
        setValues(filter?.values ?? []);
    }, [filter?.values]);

    if (isLoading) {
        return 'Loading...';
    }

    const updateValue = (_value: FilterConfigValue[]) => {
        setValues(_value);
        updateFilterValue(filter, _value);
    };

    let inputFormType;
    const config = getConfigByClassId(filter.range);
    inputFormType = config.inputFormType;
    if (CLASSES.STRING === filter.range) {
        inputFormType = 'text';
    }
    if (CLASSES.DECIMAL === filter.range || CLASSES.INTEGER === filter.range) {
        inputFormType = 'number';
    }
    const BOOLEAN_OPTIONS = [
        { value: 'true', label: 'true' },
        { value: 'false', label: 'false' },
    ];

    const convertFilterConfigValue2Resource = (filterConfigValue: FilterConfigValue) =>
        !isString(filterConfigValue.value) ? filterConfigValue.value : resources?.find((r) => r.id === filterConfigValue.value);

    const convertResource2FilterConfigValue = (value: OptionType) => ({ op: 'EQ', value });

    const Forms = {
        boolean: (
            <>
                <SelectGlobalStyle />
                <Select
                    onChange={(selected) => {
                        updateValue(selected ? [{ op: 'EQ', value: selected.value }] : []);
                    }}
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable={false}
                    value={BOOLEAN_OPTIONS.find((o) => o.value === values?.[0]?.value)}
                    options={BOOLEAN_OPTIONS}
                />
            </>
        ),
        autocomplete: (
            <Autocomplete
                entityType={ENTITIES.RESOURCE}
                baseClass={filter.range}
                placeholder="Select or type to enter a resource"
                onChange={(selected) =>
                    updateValue((selected as OptionType[])?.map((v) => convertResource2FilterConfigValue(v) as FilterConfigValue))
                }
                value={values?.map((v) => convertFilterConfigValue2Resource(v) as OptionType)}
                openMenuOnFocus
                isClearable
                enableExternalSources={false}
                isMulti
                allowCreate={false}
            />
        ),
        number: <NumberInputField filter={filter} updateValue={updateValue} />,
        default: (
            <Input
                placeholder="Enter a value"
                name="literalValue"
                // @ts-expect-error
                type={inputFormType}
                value={(values?.[0]?.value as string) || ''}
                onChange={(e) => updateValue([{ op: 'EQ', value: e.target.value }])}
                className="flex-grow d-flex"
                style={{ minWidth: '250px' }}
                autoFocus
            />
        ),
    };
    if (inputFormType === 'boolean') return Forms.boolean;
    if (inputFormType === 'autocomplete') return Forms.autocomplete;
    if (inputFormType === 'number') return Forms.number;
    return Forms.default;
};

export default FilterInputField;
