import { useState } from 'react';
import { Button } from 'reactstrap';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import FilterWrapper from 'components/Comparison/Filters/FilterWrapper';
import FilterModal from 'components/Comparison/Filters/FilterModal';
import { faFilter, faLevelUpAlt, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { getRuleByProperty, getValuesByProperty, getDataByProperty } from 'utils';
import styled from 'styled-components';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const FilterButton = styled(Button)`
    &&& {
        position: relative;
        padding: 0 5px;
        color: ${props => props.theme.lightDarker};
        &:hover,
        &.active {
            color: ${props => props.theme.secondaryDarker};
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
            background-color: ${props => props.theme.secondaryDarker};
        }
        & .cross:before {
            transform: rotate(45deg);
        }
        & .cross:after {
            transform: rotate(-45deg);
        }
    }
`;

const PropertyValue = ({
    id,
    label,
    property,
    similar,
    filterControlData,
    updateRulesOfProperty,
    embeddedMode,
    group,
    grouped = false,
    handleToggleShow,
    groupId,
    hiddenGroups
}) => {
    const [showStatementBrowser, setShowStatementBrowser] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    const updateRulesFactory = newRules => updateRulesOfProperty(newRules, id);

    const handleOpenStatementBrowser = () => {
        setShowStatementBrowser(true);
    };

    const getValuesNr = () => {
        return !group ? Object.keys(getValuesByProperty(filterControlData, id)).length : 0;
    };

    const filterButtonClasses = classNames({
        'd-block': true,
        active: !group ? getRuleByProperty(filterControlData, id).length > 0 : false
    });

    return (
        <>
            {!group && (
                <>
                    <Button onClick={handleOpenStatementBrowser} color="link" className="text-start text-light m-0 p-0 text-break user-select-auto">
                        <DescriptionTooltip
                            id={property?.id}
                            typeId={ENTITIES.PREDICATE}
                            extraContent={similar && similar.length ? `This property is merged with : ${similar.join(', ')}` : ''}
                        >
                            <div className={grouped ? 'ms-2' : ''}>
                                {grouped && <Icon icon={faLevelUpAlt} rotation={90} className="me-2" />}
                                {label}
                                {similar && similar.length > 0 && '*'}
                            </div>
                        </DescriptionTooltip>
                    </Button>
                    {!embeddedMode && (
                        <>
                            <FilterWrapper
                                data={{
                                    rules: getRuleByProperty(filterControlData, id),
                                    disabled: getValuesNr() <= 1 && getRuleByProperty(filterControlData, id).length === 0
                                }}
                            >
                                <FilterButton
                                    color="link"
                                    disabled={getValuesNr() <= 1}
                                    onClick={() => setShowFilterDialog(v => !v)}
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
                                toggleFilterDialog={() => setShowFilterDialog(v => !v)}
                            />
                        </>
                    )}
                </>
            )}
            {group && label}
            {group && (
                <Button color="link" className="px-1 py-0 m-0 text-light-darker" onClick={() => handleToggleShow(groupId)}>
                    <Icon icon={hiddenGroups.includes(groupId) ? faPlusSquare : faMinusSquare} />
                </Button>
            )}
            {showStatementBrowser && (
                <StatementBrowserDialog
                    show={true}
                    type={ENTITIES.PREDICATE}
                    toggleModal={() => setShowStatementBrowser(v => !v)}
                    id={property.id}
                    label={property.label}
                />
            )}
        </>
    );
};

PropertyValue.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    property: PropTypes.object.isRequired,
    similar: PropTypes.array,
    group: PropTypes.bool,
    grouped: PropTypes.bool,
    filterControlData: PropTypes.array.isRequired,
    updateRulesOfProperty: PropTypes.func.isRequired,
    embeddedMode: PropTypes.bool.isRequired,
    handleToggleShow: PropTypes.func.isRequired,
    groupId: PropTypes.string,
    hiddenGroups: PropTypes.array
};

PropertyValue.defaultProps = {
    label: PropTypes.string.isRequired,
    similar: PropTypes.array,
    embeddedMode: false,
    groupId: null,
    hiddenGroups: []
};

export default PropertyValue;
