import { invert, isNumber } from 'lodash';
import { FC, useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import { OPERATORS_MAP } from '@/constants/filters';
import { FilterConfig, FilterConfigOperator, FilterConfigValue } from '@/services/backend/types';

type NumberInputFieldProps = {
    filter: FilterConfig;
    updateValue: (_value: FilterConfigValue[]) => void;
};

const NumberInputField: FC<NumberInputFieldProps> = ({ filter, updateValue }) => {
    const [values, setValues] = useState<FilterConfigValue[]>(filter?.values ?? []);

    useEffect(() => {
        setValues(filter?.values ?? []);
    }, [filter?.values]);

    const noOptionsMessage = (input: { inputValue: string }) =>
        isNumber(input.inputValue) ? (
            'Possible operators: >, <, =, <=, >='
        ) : (
            <div className="text-start">
                <small>
                    Enter an expression in the format "OperatorNumber" <br />
                    Supported operators are: &lt;, &gt;, =, !=, &lt;= and &gt;= <br />
                    Example: &lt;= 30
                </small>
            </div>
        );

    const formatCreateLabel = (inputValue: string) => `Add condition "${inputValue}"`;

    const convertString2FilterConfigValue = (value: { label: string; value: string; __isNew__?: boolean }): FilterConfigValue => {
        for (const operator of Object.keys(OPERATORS_MAP)) {
            const parts = value.label.split(operator);
            if (parts.length === 2) {
                if (!Number.isNaN(parseFloat(parts[1]))) {
                    return { op: OPERATORS_MAP[operator] as FilterConfigOperator, value: parseFloat(parts[1]).toString() };
                }
            }
        }
        if (!Number.isNaN(parseFloat(value.label))) {
            return { op: OPERATORS_MAP['='] as FilterConfigOperator, value: parseFloat(value.label).toString() };
        }
        throw new Error('Invalid string format');
    };

    const convertFilterConfigValue2String = (configValue: FilterConfigValue) => ({
        label: `${invert(OPERATORS_MAP)[configValue.op]}${configValue.value}`,
        value: `${invert(OPERATORS_MAP)[configValue.op]}${configValue.value}`,
    });

    const isValidNewOption = (inputValue: string) => {
        try {
            return !!convertString2FilterConfigValue({ label: inputValue, value: inputValue });
        } catch {
            return false;
        }
    };

    return (
        <div style={{ minWidth: '250px' }}>
            <SelectGlobalStyle />
            <CreatableSelect
                onChange={(selected) => {
                    updateValue(selected.map((v: { label: string; value: string; __isNew__?: boolean }) => convertString2FilterConfigValue(v)));
                }}
                classNamePrefix="react-select"
                isClearable
                isSearchable
                isMulti
                value={values.map((v) => convertFilterConfigValue2String(v))}
                noOptionsMessage={noOptionsMessage}
                formatCreateLabel={formatCreateLabel}
                isValidNewOption={isValidNewOption}
            />
        </div>
    );
};

export default NumberInputField;
