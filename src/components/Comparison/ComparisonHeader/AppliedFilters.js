import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import AppliedRule from 'components/Comparison/Filters/AppliedRule';
import { areAllRulesEmpty } from 'components/Comparison/Filters/helpers';
import { useSelector, useDispatch } from 'react-redux';
import { removeRule } from 'slices/comparisonSlice';

export default function AppliedFilters() {
    const dispatch = useDispatch();
    const filterControlData = useSelector(state => state.comparison.filterControlData);

    const removeRuleFactory =
        ({ propertyId, type, value }) =>
        () =>
            dispatch(removeRule({ propertyId, type, value }));

    const displayRules = () =>
        []
            .concat(...filterControlData.map(item => item.rules))
            .map(({ propertyId, propertyName, type, value }) => (
                <AppliedRule
                    key={`${propertyId}#${type}`}
                    data={{ propertyId, propertyName, type, value, removeRule: removeRuleFactory({ propertyId, type, value }) }}
                />
            ));
    return (
        <div>
            {areAllRulesEmpty(filterControlData) && (
                <div className="mt-3 d-flex" style={{ flexDirection: 'column' }}>
                    <h6 className="text-secondary">
                        <Icon className="mr-1" size="sm" icon={faFilter} />
                        <b>Applied Filters:</b>
                    </h6>
                    <div className="d-flex flex-wrap">{displayRules()}</div>
                </div>
            )}
        </div>
    );
}
