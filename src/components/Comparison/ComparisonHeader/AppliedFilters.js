import AppliedRule from 'components/Comparison/Filters/AppliedRule';
import { areAllRulesEmpty } from 'components/Comparison/Filters/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { removeRule } from 'slices/comparisonSlice';

export default function AppliedFilters() {
    const dispatch = useDispatch();
    const filterControlData = useSelector((state) => state.comparison.filterControlData);

    const removeRuleFactory =
        ({ propertyId, type, value }) =>
        () =>
            dispatch(removeRule({ propertyId, type, value }));

    const displayRules = () =>
        []
            .concat(...filterControlData.map((item) => item.rules))
            .map(({ propertyId, propertyName, type, value }) => (
                <AppliedRule
                    key={`${propertyId}#${type}`}
                    data={{ propertyId, propertyName, type, value, removeRule: removeRuleFactory({ propertyId, type, value }) }}
                />
            ));
    return (
        <div>
            {areAllRulesEmpty(filterControlData) && (
                <div className="py-3 d-flex flex-column">
                    <h5 className="m-0">Applied Filters</h5>
                    <div className="d-flex flex-wrap">{displayRules()}</div>
                </div>
            )}
        </div>
    );
}
