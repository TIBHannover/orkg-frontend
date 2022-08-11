import FilterModalFooter from 'components/Comparison/Filters/FilterModalFooter';
import { FILTER_TYPES } from 'constants/comparisonFilterTypes';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Select from 'react-select';
import { ModalBody } from 'reactstrap';
import stopwords from 'stopwords-en';

const TextFilterRule = props => {
    const { property, values, rules, updateRulesOfProperty, toggleFilterDialog } = props.dataController;
    const { label: propertyName, id: propertyId } = property;

    const placeHolder = 'choose one or more keywords';

    const options = [
        ...new Set(
            Object.keys(values)
                .reduce((prev, curr) => `${prev} ${curr}`, '')
                .replace(/[.,/#!$%^&*;:{}=_`~()0-9]+/g, '')
                .toLowerCase()
                .split(' '),
        ),
    ]
        .filter(val => val.length > 1 && !stopwords.includes(val))
        .map(val => ({ value: val, label: val }));

    const keyWordRule = rules.find(item => item.propertyId === propertyId && item.type === FILTER_TYPES.INC);
    const selectedOptions = typeof keyWordRule === 'undefined' ? null : options.filter(({ value }) => keyWordRule.value.includes(value));
    const [selectedKeys, setSelectedKeys] = useState(selectedOptions);

    const calRules = selectedVals =>
        selectedVals ? [{ propertyId, propertyName, type: FILTER_TYPES.INC, value: selectedVals.map(({ value }) => value) }] : [];

    const handleChange = selectedOption => {
        setSelectedKeys(selectedOption);
    };

    const handleReset = () => {
        updateRulesOfProperty([]);
        setSelectedKeys(null);
    };

    const handleApply = () => {
        updateRulesOfProperty(calRules(selectedKeys));
        toggleFilterDialog();
    };

    return (
        <>
            <ModalBody>
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
            </ModalBody>
            <FilterModalFooter handleApply={handleApply} handleCancel={toggleFilterDialog} handleReset={handleReset} />
        </>
    );
};
TextFilterRule.propTypes = {
    dataController: PropTypes.object.isRequired,
};
export default TextFilterRule;
