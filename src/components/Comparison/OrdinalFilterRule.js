import React, { useState } from 'react';
import { Input, FormFeedback, Label } from 'reactstrap';
import PropTypes from 'prop-types';

const OrdinalFilterRule = props => {
    const { property, rules, updateRules, typeIsDate, DATE_FORMAT } = props.controldata;
    const { label: propertyName, id: propertyId } = property;

    const type = typeIsDate ? 'datetime' : 'number';

    const minPlaceHolder = typeIsDate ? 'yyyy-mm-dd' : 'min';
    const minLabel = typeIsDate ? 'is after or at the same date' : 'is greater than or equal to';
    const minRuleType = typeIsDate ? 'gteDate' : 'gte';

    const maxPlaceHolder = typeIsDate ? 'yyyy-mm-dd' : 'max';
    const maxLabel = typeIsDate ? 'is before or at the same date' : 'is less than or equal to';
    const maxRuleType = typeIsDate ? 'lteDate' : 'lte';

    const nEqPlaceHolder = typeIsDate ? 'yyyy-mm-dd' : 'value';
    const nEqLabel = 'not equal to';
    const nEqRuleType = typeIsDate ? 'nEqDate' : 'nEq';

    const invalidText = typeIsDate ? 'should match the format: yyyy-mm-dd' : 'should be Number';
    const validateFunc = str => (typeIsDate ? isDate(str) : isNum(str));

    const minRule = rules.find(item => item.propertyId === propertyId && item.type === minRuleType);
    const maxRule = rules.find(item => item.propertyId === propertyId && item.type === maxRuleType);
    const nEqRule = rules.find(item => item.propertyId === propertyId && item.type === nEqRuleType);
    const minValue = typeof minRule === 'undefined' ? '' : minRule.value;
    const maxValue = typeof maxRule === 'undefined' ? '' : maxRule.value;
    const nEqValue = typeof nEqRule === 'undefined' ? '' : nEqRule.value;

    const [minInput, setMinInput] = useState(minValue);
    const [minInvalid, setMinInvalid] = useState(false);

    const [maxInput, setMaxInput] = useState(maxValue);
    const [maxInvalid, setMaxInvalid] = useState(false);

    const [nEqInput, setNeqInput] = useState(nEqValue);
    const [nEqInvalid, setNeqInvalid] = useState(false);

    const isDate = str => str.match(DATE_FORMAT);
    const isNum = str => !isNaN(str) && !isNaN(parseFloat(str));
    const isEmptyOrValid = str => str === '' || validateFunc(str);

    const calRules = (min, max, val) => {
        const rules = [];
        min !== '' && validateFunc(min) && rules.push({ propertyId, propertyName, type: minRuleType, value: min });
        max !== '' && validateFunc(max) && rules.push({ propertyId, propertyName, type: maxRuleType, value: max });
        val !== '' && validateFunc(val) && rules.push({ propertyId, propertyName, type: nEqRuleType, value: val });
        return rules;
    };

    const handleMinChange = event => {
        setMinInput(event.target.value);
        isEmptyOrValid(event.target.value) ? setMinInvalid(false) : setMinInvalid(true);
        updateRules(calRules(event.target.value, maxInput, nEqInput));
    };
    const handleMaxChange = event => {
        setMaxInput(event.target.value);
        isEmptyOrValid(event.target.value) ? setMaxInvalid(false) : setMaxInvalid(true);
        updateRules(calRules(minInput, event.target.value, nEqInput));
    };

    const handleNeqChange = event => {
        setNeqInput(event.target.value);
        isEmptyOrValid(event.target.value) ? setNeqInvalid(false) : setNeqInvalid(true);
        updateRules(calRules(minInput, maxInput, event.target.value));
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
                        bsSize="sm"
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
                        bsSize="sm"
                        value={maxInput}
                        invalid={maxInvalid}
                        onChange={handleMaxChange}
                    />
                </div>
                <FormFeedback className={maxInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
                <div className="mt-3 d-flex align-items-baseline">
                    <Label style={w_50}>{nEqLabel}</Label>
                    <Input
                        style={w_50}
                        type={type}
                        id={`neq${propertyId}`}
                        placeholder={nEqPlaceHolder}
                        bsSize="sm"
                        value={nEqInput}
                        invalid={nEqInvalid}
                        onChange={handleNeqChange}
                    />
                </div>
                <FormFeedback className={nEqInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
            </div>
        </>
    );
};

OrdinalFilterRule.propTypes = {
    controldata: PropTypes.object.isRequired
};
export default OrdinalFilterRule;
