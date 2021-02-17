import { useState, useCallback } from 'react';
import { Input, FormFeedback, Label, Button, Col, FormGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import { FILTER_TYPES } from 'constants/comparisonFilterTypes';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import Joi from '@hapi/joi';

const createOption = label => ({
    label,
    value: label
});

const OrdinalFilterRule = props => {
    //change apply and reset
    const { property, rules, updateRulesOfProperty, typeIsDate, toggleFilterDialog } = props.dataController;
    const { label: propertyName, id: propertyId } = property;

    const type = typeIsDate ? 'date' : 'number';

    const minPlaceHolder = typeIsDate ? 'yyyy-mm-dd' : 'min';
    const minLabel = typeIsDate ? 'is after or at the same date' : 'is greater than or equal to';
    const minRuleType = typeIsDate ? FILTER_TYPES.GTE_DATE : FILTER_TYPES.GTE;

    const maxPlaceHolder = typeIsDate ? 'yyyy-mm-dd' : 'max';
    const maxLabel = typeIsDate ? 'is before or at the same date' : 'is less than or equal to';
    const maxRuleType = typeIsDate ? FILTER_TYPES.LTE_DATE : FILTER_TYPES.LTE;

    const nEqPlaceHolder = typeIsDate ? null : 'value1,value2,...';
    const nEqLabel = 'not equal to';
    const nEqRuleType = typeIsDate ? FILTER_TYPES.NEQ_DATE : FILTER_TYPES.NEQ;

    const invalidText = typeIsDate ? 'should match the format: yyyy-mm-dd' : 'should be Number';
    const validateFunc = str => (typeIsDate ? isDate(str) : isNum(str));
    const isDate = str => {
        const { error } = Joi.date()

            .required()
            .validate(str);
        return !error ? true : false;
    };

    const isNum = str => !isNaN(str) && !isNaN(parseFloat(str));
    const isEmptyOrValid = str => !str || validateFunc(str);

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

    const [nEqInputValue, setNEqInputValue] = useState('');
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
                .map(v => (typeIsDate ? v : parseFloat(v)));
        notEqualValues.length > 0 && rules.push({ propertyId, propertyName, type: nEqRuleType, value: notEqualValues });
        return rules;
    };

    const handleMinChange = event => {
        setMinInput(event.target.value);
        isEmptyOrValid(event.target.value) ? setMinInvalid(false) : setMinInvalid(true);
    };

    const handleMaxChange = event => {
        setMaxInput(event.target.value);
        isEmptyOrValid(event.target.value) ? setMaxInvalid(false) : setMaxInvalid(true);
    };

    const handleChangeSel = value => {
        const valueWithoutNUll = !value ? [] : value;
        setNEqValue(valueWithoutNUll);
    };

    const handleInputChangeSel = (nEqInputValue, { action }) => {
        if (action !== 'input-blur' && action !== 'menu-close') {
            isEmptyOrValid(nEqInputValue) ? setNeqInvalid(false) : setNeqInvalid(true);
            setNEqInputValue(nEqInputValue);
        }
    };

    const handleKeyDownSel = event => {
        if (!isEmptyOrValid(nEqInputValue)) {
            return;
        }
        if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',') {
            setNEqInputValue('');
            setNEqValue(nEqValue => [...nEqValue, createOption(nEqInputValue)]);
            event.preventDefault();
        }
    };

    const handleReset = () => {
        setMaxInput('');
        setMinInput('');
        setMinInvalid(false);
        setMaxInvalid(false);
        setNeqInvalid(false);
        setNEqInputValue('');
        setNEqValue([]);
    };

    const handleApply = () => {
        updateRulesOfProperty(calRules(minInput, maxInput, [...nEqValue, createOption(nEqInputValue)]));
        toggleFilterDialog();
    };

    const handleDatePickerOnBlur = useCallback(event => {
        const value = event.target.value;
        if (!value) {
            return;
        }
        setNEqInputValue('');
        setNEqValue(nEqValue => [...nEqValue, createOption(value)]);
    }, []);

    const CustomInput = useCallback(
        ({ ...innerProps }) => {
            if (typeIsDate) {
                return (
                    <Input
                        value={innerProps.value}
                        className="form-control-sm"
                        onBlur={handleDatePickerOnBlur}
                        onInput={e => setNEqInputValue(e.target.value)}
                        type="date"
                    />
                );
            }
            return <components.Input {...innerProps} />;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const customStyles = {
        valueContainer: provided => ({
            ...provided,
            '& input': {
                backgroundColor: 'transparent !important',
                border: '0 !important'
            }
        })
    };

    return (
        <>
            <FormGroup row>
                <Label sm={6}>{minLabel}</Label>
                <Col sm={6}>
                    <Input
                        type={type}
                        id={`min${propertyId}`}
                        placeholder={minPlaceHolder}
                        value={minInput}
                        invalid={minInvalid}
                        onChange={handleMinChange}
                    />
                    <FormFeedback className={minInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label sm={6}>{maxLabel}</Label>
                <Col sm={6}>
                    <Input
                        type={type}
                        id={`max${propertyId}`}
                        placeholder={maxPlaceHolder}
                        value={maxInput}
                        invalid={maxInvalid}
                        onChange={handleMaxChange}
                    />

                    <FormFeedback className={maxInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
                </Col>
            </FormGroup>

            <FormGroup row>
                <Label sm={6}>{nEqLabel}</Label>
                <Col sm={6}>
                    <CreatableSelect
                        styles={customStyles}
                        components={{
                            DropdownIndicator: null,
                            Input: CustomInput
                        }}
                        inputValue={nEqInputValue}
                        isClearable
                        isMulti
                        menuIsOpen={false}
                        onChange={handleChangeSel}
                        onInputChange={handleInputChangeSel}
                        onKeyDown={handleKeyDownSel}
                        placeholder={nEqPlaceHolder}
                        value={nEqValue}
                    />
                </Col>
                <FormFeedback className={nEqInvalid ? 'd-block text-right' : 'd-none'}>{invalidText}</FormFeedback>
            </FormGroup>

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

OrdinalFilterRule.propTypes = {
    dataController: PropTypes.object.isRequired
};
export default OrdinalFilterRule;
