import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import stopwords from 'stopwords-en';

const TextFilterRule = props => {
    const { property, values, rules, updateRules } = props.controldata;
    const { label: propertyName, id: propertyId } = property;

    const placeHolder = 'choese one or more keywords';

    const options = [
        ...new Set(
            Object.keys(values)
                .reduce((prev, curr) => prev + ' ' + curr, '')
                .replace(/[.,/#!$%^&*;:{}=_`~()0-9]+/g, '')
                .toLowerCase()
                .split(' ')
        )
    ]
        .filter(val => val.length > 1 && !stopwords.includes(val))
        .map(val => ({ value: val, label: val }));

    const keyWordRule = rules.find(item => item.propertyId === propertyId && item.type === 'inc');
    const selectedOptions = typeof keyWordRule === 'undefined' ? null : options.filter(({ value }) => keyWordRule.value.includes(value));
    const [selectedKeys, setSelectedKeys] = useState(selectedOptions);

    const calRules = selectedVals => (selectedVals ? [{ propertyId, propertyName, type: 'inc', value: selectedVals.map(({ value }) => value) }] : []);

    const handleChange = selectedOption => {
        updateRules(calRules(selectedOption));
        setSelectedKeys(selectedOption);
    };
    return (
        <Select
            className="mt-2 w-100"
            value={selectedKeys}
            id={`input${propertyId}`}
            placeholder={placeHolder}
            onChange={handleChange}
            options={options}
            isSearchable
            isMulti
        />
    );
};
TextFilterRule.propTypes = {
    controldata: PropTypes.object.isRequired
};
export default TextFilterRule;
