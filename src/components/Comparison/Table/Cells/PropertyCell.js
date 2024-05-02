import { faFilter, faLevelUpAlt, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import FilterModal from 'components/Comparison/Filters/FilterModal';
import FilterWrapper from 'components/Comparison/Filters/FilterWrapper';
import { getDataByProperty, getRuleByProperty, getValuesByProperty } from 'components/Comparison/Filters/helpers';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { ENTITIES } from 'constants/graphSettings';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { handleToggleGroupVisibility, updateRulesOfProperty } from 'slices/comparisonSlice';
import styled from 'styled-components';

const FilterButton = styled(Button)`
    &&& {
        position: relative;
        padding: 0 5px;
        color: ${(props) => props.theme.lightDarker};
        &:hover,
        &.active {
            color: ${(props) => props.theme.secondaryDarker};
        }

        & .cross {
            position: absolute;
            right: 12px;
            top: 2px;
            width: 12px;
            height: 12px;
        }
        & .cross:hover {
            opacity: 1;
        }
        & .cross:before,
        & .cross:after {
            position: absolute;
            left: 15px;
            content: ' ';
            height: 12px;
            width: 2px;
            background-color: ${(props) => props.theme.secondaryDarker};
        }
        & .cross:before {
            transform: rotate(45deg);
        }
        & .cross:after {
            transform: rotate(-45deg);
        }
    }
`;

const PropertyCell = ({ id, label, property, similar, group, grouped = false, groupId = null }) => {
    const [showStatementBrowser, setShowStatementBrowser] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const dispatch = useDispatch();
    const updateRulesFactory = (newRules) => dispatch(updateRulesOfProperty(newRules, id));
    const filterControlData = useSelector((state) => state.comparison.filterControlData);
    const isEmbeddedMode = useSelector((state) => state.comparison.isEmbeddedMode);
    const hiddenGroups = useSelector((state) => state.comparison.hiddenGroups);
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const columnWidth = useSelector((state) => state.comparison.configuration.columnWidth);
    const handleOpenStatementBrowser = () => {
        setShowStatementBrowser(true);
    };

    const getValuesNr = () => (!group ? Object.keys(getValuesByProperty(filterControlData, id)).length : 0);

    const filterButtonClasses = classNames({
        'd-block': true,
        active: !group ? getRuleByProperty(filterControlData, id).length > 0 : false,
    });

    return (
        <>
            {!group && (
                <>
                    <Button onClick={handleOpenStatementBrowser} color="link" className="text-start text-light m-0 p-0 text-break user-select-auto">
                        <DescriptionTooltip
                            id={property?.id}
                            _class={ENTITIES.PREDICATE}
                            extraContent={
                                <>
                                    {similar && similar.length ? (
                                        <tr>
                                            <td colSpan="2">This property is merged with: {similar?.join?.(', ')}</td>
                                        </tr>
                                    ) : (
                                        ''
                                    )}
                                    {columnWidth && columnWidth < 100 && transpose && (
                                        <tr>
                                            <td>Label</td>
                                            <td>{label}</td>
                                        </tr>
                                    )}
                                </>
                            }
                        >
                            <div className={grouped ? 'ms-2' : ''}>
                                {grouped && <Icon icon={faLevelUpAlt} rotation={90} className="me-2" />}
                                {columnWidth && columnWidth < 100 && transpose ? truncate(label, { length: 10 }) : label}
                                {similar && similar.length > 0 && '*'}
                            </div>
                        </DescriptionTooltip>
                    </Button>
                    {!isEmbeddedMode && (
                        <>
                            <FilterWrapper
                                data={{
                                    rules: getRuleByProperty(filterControlData, id),
                                    disabled: getValuesNr() <= 1 && getRuleByProperty(filterControlData, id).length === 0,
                                }}
                            >
                                <FilterButton
                                    color="link"
                                    disabled={getValuesNr() <= 1}
                                    onClick={() => setShowFilterDialog((v) => !v)}
                                    className={filterButtonClasses}
                                >
                                    <Icon size="xs" icon={faFilter} />
                                    {getValuesNr() <= 1 && <div className="cross" />}
                                </FilterButton>
                            </FilterWrapper>

                            <FilterModal
                                data={getDataByProperty(filterControlData, id)}
                                updateRulesOfProperty={updateRulesFactory}
                                showFilterDialog={showFilterDialog}
                                toggleFilterDialog={() => setShowFilterDialog((v) => !v)}
                            />
                        </>
                    )}
                </>
            )}
            {group && label}
            {group && (
                <Button
                    color="link"
                    className="px-1 py-0 m-0 text-light-darker"
                    onClick={(e) => {
                        e.stopPropagation();
                        dispatch(handleToggleGroupVisibility?.(groupId));
                    }}
                >
                    <Icon icon={hiddenGroups.includes(groupId) ? faPlusSquare : faMinusSquare} />
                </Button>
            )}
            {showStatementBrowser && (
                <StatementBrowserDialog
                    show
                    type={ENTITIES.PREDICATE}
                    toggleModal={() => setShowStatementBrowser((v) => !v)}
                    id={property.id}
                    label={property.label}
                />
            )}
        </>
    );
};

PropertyCell.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    property: PropTypes.object.isRequired,
    similar: PropTypes.array,
    group: PropTypes.bool,
    grouped: PropTypes.bool,
    groupId: PropTypes.string,
};

export default PropertyCell;
