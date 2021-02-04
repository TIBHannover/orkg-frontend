import { useState } from 'react';
import { Button } from 'reactstrap';
import Tippy from '@tippyjs/react';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import FilterWrapper from 'components/Comparison/FilterWrapper';
import FilterModal from 'components/Comparison/FilterModal';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { upperFirst } from 'lodash';
import PropTypes from 'prop-types';

const PropertyValue = ({ id, label, similar, getRuleByProperty, data, stringifyType, controllData, updateRules }) => {
    const [showStatementBrowser, setShowStatementBrowser] = useState(false);

    const [showFilterDialog, setShowFilterDialog] = useState(false);

    const getValuesByPropertyLabel = inputId => controllData.find(item => item.property.id === inputId);

    const updateRulesFactory = newRules => updateRules(newRules, id);

    const handleOpenStatementBrowser = () => {
        setShowStatementBrowser(true);
    };

    const getValuesNr = values => {
        return new Set(
            []
                .concat(...values)
                .map(item => item.label)
                .filter(truthy => truthy)
        ).size;
    };

    return (
        <>
            <ConditionalWrapper
                condition={similar && similar.length}
                wrapper={children => (
                    <Tippy content={`This property is merged with : ${similar.join(', ')}`} arrow={true}>
                        <span>{children}*</span>
                    </Tippy>
                )}
            >
                <Button onClick={handleOpenStatementBrowser} color="link" className="text-light m-0 p-0">
                    {upperFirst(label)}
                </Button>
            </ConditionalWrapper>

            <FilterWrapper
                data={{
                    rules: getRuleByProperty(id),
                    stringifyType: stringifyType
                }}
            >
                <Icon
                    icon={faFilter}
                    className={getValuesNr(data[id]) > 1 ? 'd-block' : 'd-none'}
                    style={{ cursor: 'pointer' }}
                    color={getRuleByProperty(id).length > 0 ? '#e86161' : ''}
                    onClick={() => setShowFilterDialog(v => !v)}
                />
            </FilterWrapper>

            <FilterModal
                data={getValuesByPropertyLabel(id)}
                updateRules={updateRulesFactory}
                showFilterDialog={showFilterDialog}
                toggleFilterDialog={() => setShowFilterDialog(v => !v)}
            />

            {showStatementBrowser && (
                <StatementBrowserDialog show={true} type="property" toggleModal={() => setShowStatementBrowser(v => !v)} id={id} label={label} />
            )}
        </>
    );
};

PropertyValue.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    similar: PropTypes.array,
    data: PropTypes.object.isRequired,
    stringifyType: PropTypes.func.isRequired,
    getRuleByProperty: PropTypes.func.isRequired,
    controllData: PropTypes.array.isRequired,
    updateRules: PropTypes.func.isRequired
};

PropertyValue.defaultProps = {
    label: PropTypes.string.isRequired,
    similar: PropTypes.array
};

export default PropertyValue;
