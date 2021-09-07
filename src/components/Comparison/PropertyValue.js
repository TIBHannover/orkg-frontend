import { useState } from 'react';
import { Button } from 'reactstrap';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import FilterWrapper from 'components/Comparison/Filters/FilterWrapper';
import FilterModal from 'components/Comparison/Filters/FilterModal';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { getRuleByProperty, getValuesByProperty, getDataByProperty } from 'utils';
import styled from 'styled-components';
import { upperFirst } from 'lodash';
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

const PropertyValue = ({ id, label, property, similar, filterControlData, updateRulesOfProperty, embeddedMode }) => {
    const [showStatementBrowser, setShowStatementBrowser] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    const updateRulesFactory = newRules => updateRulesOfProperty(newRules, id);

    const handleOpenStatementBrowser = () => {
        setShowStatementBrowser(true);
    };

    const getValuesNr = () => {
        return Object.keys(getValuesByProperty(filterControlData, id)).length;
    };

    const filterButtonClasses = classNames({
        'd-block': true,
        active: getRuleByProperty(filterControlData, id).length > 0
    });

    return (
        <>
            <Button onClick={handleOpenStatementBrowser} color="link" className="text-left text-light m-0 p-0">
                <DescriptionTooltip
                    id={property?.id}
                    typeId={ENTITIES.PREDICATE}
                    extraContent={similar && similar.length ? `This property is merged with : ${similar.join(', ')}` : ''}
                >
                    {upperFirst(label)}
                    {similar && similar.length > 0 && '*'}
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
    id: PropTypes.string.isRequired,
    property: PropTypes.object.isRequired,
    similar: PropTypes.array,
    filterControlData: PropTypes.array.isRequired,
    updateRulesOfProperty: PropTypes.func.isRequired,
    embeddedMode: PropTypes.bool.isRequired
};

PropertyValue.defaultProps = {
    label: PropTypes.string.isRequired,
    similar: PropTypes.array,
    embeddedMode: false
};

export default PropertyValue;
