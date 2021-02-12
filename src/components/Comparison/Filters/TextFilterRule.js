import { useState } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import stopwords from 'stopwords-en';
import PropTypes from 'prop-types';

const TextFilterRule = props => {
    const { property, values, rules, updateRulesOfProperty, toggleFilterDialog } = props.dataController;
    const { label: propertyName, id: propertyId } = property;

    const placeHolder = 'choose one or more keywords';

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
            <div className="d-flex flex-sm-wrap justify-content-end">
                <Button className="mt-3 mx-1" color="secondary" size="sm" onClick={handleReset}>
                    <Icon icon={faRedoAlt} style={{ margin: '2px 6px 0 0' }} />
                    Reset
                </Button>
                <Button className="mt-3 mx-1" color="primary" size="sm" onClick={handleApply}>
                    Apply
                </Button>
            </div>
        </>
    );
};
TextFilterRule.propTypes = {
    dataController: PropTypes.object.isRequired
};
export default TextFilterRule;
