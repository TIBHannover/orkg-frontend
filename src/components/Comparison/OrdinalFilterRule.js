import React, { useState } from 'react';
import { Input, FormFeedback, Label, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import CreatableSelect from 'react-select/creatable';

const customStyles = {
    control: (provided, state) => {
        return {
            ...provided,
            backgroundColor: '#f7f7f7 !important',
            border: '1px solid #ced4da',
            color: '#5b6987',
            borderRadius: '6px',
            fontSize: '1rem',
            lineHeight: '12px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgb(232 97 97 / 25%)' : '',
            ':hover': {
                border: '1px solid #ced4da'
            },
            ':focus': {
                border: '1px solid #ced4da',
                boxShadow: '0 0 0 0.2rem rgb(232 97 97 / 25%)'
            }
        };
    },
    container: provided => {
        return {
            ...provided,
            height: '10%',
            backgroundColor: '#ffffff'
        };
    }
};
const createOption = label => ({
    label,
    value: label
});

const OrdinalFilterRule = props => {
    //change apply and reset
    const { property, rules, updateRules, typeIsDate, DATE_FORMAT, toggleFilteDialog } = props.controldata;
    const { label: propertyName, id: propertyId } = property;

    const type = typeIsDate ? 'datetime' : 'number';

    const minPlaceHolder = typeIsDate ? 'yyyy-mm-dd' : 'min';
    const minLabel = typeIsDate ? 'is after or at the same date' : 'is greater than or equal to';
    const minRuleType = typeIsDate ? 'gteDate' : 'gte';

    const maxPlaceHolder = typeIsDate ? 'yyyy-mm-dd' : 'max';
    const maxLabel = typeIsDate ? 'is before or at the same date' : 'is less than or equal to';
    const maxRuleType = typeIsDate ? 'lteDate' : 'lte';

    const nEqPlaceHolder = typeIsDate ? 'date1,date2,...' : 'value1,value2,...';
    const nEqLabel = 'not equal to';
    const nEqRuleType = typeIsDate ? 'nEqDate' : 'nEq';

    const invalidText = typeIsDate ? 'should match the format: yyyy-mm-dd' : 'should be Number';
    const validateFunc = str => (typeIsDate ? isDate(str) : isNum(str));
    const isDate = str => str.match(DATE_FORMAT);
    const isNum = str => !isNaN(str) && !isNaN(parseFloat(str));
    const isEmptyOrValid = str => str === '' || validateFunc(str);

    const minRule = rules.find(item => item.propertyId === propertyId && item.type === minRuleType);
    const maxRule = rules.find(item => item.propertyId === propertyId && item.type === maxRuleType);
    const nEqRule = rules.find(item => item.propertyId === propertyId && item.type === nEqRuleType);
    const minValue = typeof minRule === 'undefined' ? '' : minRule.value;
    const maxValue = typeof maxRule === 'undefined' ? '' : maxRule.value;
    const nEqValueArr = typeof nEqRule === 'undefined' ? [] : nEqRule.value.map(createOption);

    const [minInput, setMinInput] = useState(minValue);
    const [minInvalid, setMinInvalid] = useState(false);

    const [maxInput, setMaxInput] = useState(maxValue);
    const [maxInvalid, setMaxInvalid] = useState(false);

    const [nEqInuptValue, setNEqInuptValue] = useState('');
    const [nEqValue, setNEqValue] = useState(nEqValueArr);
    const [nEqInvalid, setNeqInvalid] = useState(false);

    const calRules = (min, max, val) => {
        const rules = [];
        min !== '' && validateFunc(min) && rules.push({ propertyId, propertyName, type: minRuleType, value: min });
        max !== '' && validateFunc(max) && rules.push({ propertyId, propertyName, type: maxRuleType, value: max });

        const notEqualValues =
            val.length > 0 &&
            val
                .map(item => item.label)
                .filter(validateFunc)
                .map(parseFloat);
        notEqualValues.length > 0 && rules.push({ propertyId, propertyName, type: nEqRuleType, value: notEqualValues });
        return rules;
    };

    const handleMinChange = event => {
        setMinInput(event.target.value);
        isEmptyOrValid(event.target.value) ? setMinInvalid(false) : setMinInvalid(true);
        updateRules(calRules(event.target.value, maxInput, nEqValue));
    };
    const handleMaxChange = event => {
        setMaxInput(event.target.value);
        isEmptyOrValid(event.target.value) ? setMaxInvalid(false) : setMaxInvalid(true);
        updateRules(calRules(minInput, event.target.value, nEqValue));
    };

    const handleChangeSel = value => {
        const valueWithoutNUll = !value ? [] : value;
        setNEqValue(valueWithoutNUll);
        updateRules(calRules(minInput, maxInput, valueWithoutNUll));
    };
    const handleInputChangeSel = (nEqInuptValue, { action }) => {
        if (action !== 'input-blur' && action !== 'menu-close') {
            isEmptyOrValid(nEqInuptValue) ? setNeqInvalid(false) : setNeqInvalid(true);
            setNEqInuptValue(nEqInuptValue);
        }
    };
    const handleKeyDownSel = event => {
        if (!isEmptyOrValid(nEqInuptValue)) {
            return;
        }
        if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',') {
            setNEqInuptValue('');
            setNEqValue([...nEqValue, createOption(nEqInuptValue)]);
            updateRules(calRules(minInput, maxInput, [...nEqValue, createOption(nEqInuptValue)]));
            event.preventDefault();
        }
    };

    const handleReset = () => {
        setMaxInput('');
        setMinInput('');
        setMinInvalid(false);
        setMaxInvalid(false);
        setNeqInvalid(false);
        setNEqInuptValue('');
        setNEqValue([]);
    };

    const handleApply = () => {
        updateRules(calRules(minInput, maxInput, [...nEqValue, createOption(nEqInuptValue)]));
        toggleFilteDialog();
    };

    const w_50 = { width: '50%' };
    return (
        <>
            <div className="w-100">
                <div className="mt-2 d-flex align-items-baseline">
                    <Label style={w_50}>{minLabel}</Label>
                    <Input
                        style={w_50}
                        type={type}
                        id={`min${propertyId}`}
                        placeholder={minPlaceHolder}
                        value={minInput}
                        invalid={minInvalid}
                        onChange={handleMinChange}
                    />
                </div>
                <FormFeedback className={minInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
                <div className="mt-3 d-flex align-items-baseline">
                    <Label style={w_50}>{maxLabel}</Label>
                    <Input
                        style={w_50}
                        type={type}
                        id={`max${propertyId}`}
                        placeholder={maxPlaceHolder}
                        value={maxInput}
                        invalid={maxInvalid}
                        onChange={handleMaxChange}
                    />
                </div>
                <FormFeedback className={maxInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
                <div className="mt-3 d-flex align-items-baseline">
                    <Label style={w_50}>{nEqLabel}</Label>
                    <div style={{ ...w_50 }}>
                        <CreatableSelect
                            styles={customStyles}
                            components={{
                                DropdownIndicator: null
                            }}
                            inputValue={nEqInuptValue}
                            isClearable
                            isMulti
                            menuIsOpen={false}
                            onChange={handleChangeSel}
                            onInputChange={handleInputChangeSel}
                            onKeyDown={handleKeyDownSel}
                            placeholder={nEqPlaceHolder}
                            value={nEqValue}
                        />
                    </div>
                </div>
                <FormFeedback className={nEqInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
            </div>

            <div className="d-flex flex-sm-wrap justify-content-end">
                <Button className="mt-3 mx-1" color="primary" size="sm" onClick={handleReset}>
                    <Icon icon={faRedoAlt} style={{ margin: '2px 6px 0 0' }} />
                    Reset
                </Button>
                <Button className="mt-3 mx-1" color="secondary" size="sm" onClick={handleApply}>
                    Apply
                </Button>
            </div>
        </>
    );
};

OrdinalFilterRule.propTypes = {
    controldata: PropTypes.object.isRequired
};
export default OrdinalFilterRule;
