import FilterModalFooter from 'components/Comparison/Filters/FilterModalFooter';
import { FILTER_TYPES } from 'constants/comparisonFilterTypes';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Badge, Button, CustomInput, ModalBody } from 'reactstrap';

const CategoricalFilterRule = props => {
    const { property, values, rules, updateRulesOfProperty, toggleFilterDialog } = props.dataController;
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
            checked: rules.filter(item => item.propertyId === propertyId && item.type === FILTER_TYPES.ONE_OF && item.value.includes(key)).length > 0
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const [categoricalValues, setCategoricalValues] = useState(vals);

    const calRules = list => {
        const checkedList = list.filter(item => item.checked);
        return checkedList.length > 0 ? [{ propertyId, propertyName, type: FILTER_TYPES.ONE_OF, value: checkedList.map(({ label }) => label) }] : [];
    };

    const handleCheckboxChange = event => {
        event.persist();
        setCategoricalValues(pervState => {
            const newState = [...pervState];
            const toChangeIndex = newState.findIndex(item => item.label === event.target.id);
            const toChange = { ...newState[toChangeIndex] };
            toChange.checked = event.target.checked;
            newState[toChangeIndex] = toChange;
            return newState;
        });
    };

    const handleButtonChange = () => {
        setMaxCategoryNumber(pervState => (pervState === DEFAULT_MAX_CATEGORIES ? categoricalValues.length : DEFAULT_MAX_CATEGORIES));
        setBtnLabel(pervState => (pervState === SHOW_MORE ? SHOW_LESS : SHOW_MORE));
    };

    const handleReset = () => {
        setCategoricalValues(vals.map(value => ({ ...value, checked: false })));
    };
    const handleApply = () => {
        updateRulesOfProperty(calRules(categoricalValues));
        toggleFilterDialog();
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
                    <Badge color="light" className="ml-2" pill>
                        {values[item.label].length}
                    </Badge>
                </CustomInput>
            );
        });
    };

    return (
        <>
            <ModalBody>
                <div className="ml-2">
                    {checkboxList()}

                    <Button className={getValuesNr() < DEFAULT_MAX_CATEGORIES ? 'd-none' : 'p-0'} color="link" size="sm" onClick={handleButtonChange}>
                        {btnLabel}
                    </Button>
                </div>
            </ModalBody>
            <FilterModalFooter handleApply={handleApply} handleCancel={toggleFilterDialog} handleReset={handleReset} />
        </>
    );
};
CategoricalFilterRule.propTypes = {
    dataController: PropTypes.object.isRequired
};
export default CategoricalFilterRule;
