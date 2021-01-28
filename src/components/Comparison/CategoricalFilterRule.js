import React, { useState } from 'react';
import { CustomInput, Button, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';

const CategoricalFilterRule = props => {
    const { property, values, rules, updateRules, toggleFilteDialog } = props.controldata;
    const { label: propertyName, id: propertyId } = property;

    const DEFAULT_MAX_CATEGORIES = 15;
    const SHOW_MORE = 'show more';
    const SHOW_LESS = 'show less';
    const getValuesNr = () => Object.keys(values).length;

    const [maxCategoryNumber, setMaxCategoryNumber] = useState(DEFAULT_MAX_CATEGORIES);
    const [btnLabel, setBtnLabel] = useState(SHOW_MORE);

    const vals = Object.keys(values)
        .map(key => ({
            label: key,
            checked: rules.filter(item => item.propertyId === propertyId && item.type === 'oneOf' && item.value.includes(key)).length > 0
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const [categoricalValues, setCategoricalValues] = useState(vals);
    const calRules = list => {
        const checkedlist = list.filter(item => item.checked);
        return checkedlist.length > 0 ? [{ propertyId, propertyName, type: 'oneOf', value: checkedlist.map(({ label }) => label) }] : [];
    };
    const handleCheckboxChange = event => {
        event.persist();
        setCategoricalValues(pervState => {
            const newState = [...pervState];
            const toChangeIndex = newState.findIndex(item => item.label === event.target.id);
            const toChange = { ...newState[toChangeIndex] };
            toChange.checked = event.target.checked;
            newState[toChangeIndex] = toChange;
            updateRules(calRules(newState));
            return newState;
        });
    };
    const handleButtonChange = () => {
        setMaxCategoryNumber(pervState => (pervState === DEFAULT_MAX_CATEGORIES ? categoricalValues.length : DEFAULT_MAX_CATEGORIES));
        setBtnLabel(pervState => (pervState === SHOW_MORE ? SHOW_LESS : SHOW_MORE));
    };

    const handleReset = () => {
        updateRules([]);
        setCategoricalValues(vals.map(value => ({ ...value, checked: false })));
    };
    const handleApply = () => {
        toggleFilteDialog();
    };

    const checkboxList = () => {
        return categoricalValues.slice(0, maxCategoryNumber).map(item => {
            return (
                <CustomInput
                    className="col-form-label-sm"
                    type="checkbox"
                    id={item.label}
                    key={item.label}
                    label={item.label}
                    onChange={handleCheckboxChange}
                    checked={item.checked}
                >
                    {' '}
                    <Badge color="light" pill>
                        {values[item.label].length}
                    </Badge>
                </CustomInput>
            );
        });
    };

    return (
        <div className="ml-2">
            {checkboxList()}

            <Button className={getValuesNr() < DEFAULT_MAX_CATEGORIES ? 'd-none' : 'p-0'} color="link" size="sm" onClick={handleButtonChange}>
                {btnLabel}
            </Button>
            <div className="d-flex flex-sm-wrap justify-content-end">
                <Button className="mt-3 mx-1" color="primary" size="sm" onClick={handleReset}>
                    <Icon icon={faRedoAlt} style={{ margin: '2px 6px 0 0' }} />
                    Reset
                </Button>
                <Button className="mt-3 mx-1" color="secondary" size="sm" onClick={handleApply}>
                    Apply
                </Button>
            </div>
        </div>
    );
};
CategoricalFilterRule.propTypes = {
    controldata: PropTypes.object.isRequired
};
export default CategoricalFilterRule;
