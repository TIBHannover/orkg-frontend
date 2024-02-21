import { ButtonGroup, InputGroup } from 'reactstrap';
import { AddPropertyStyle, AddPropertyContentStyle, AddPropertyFormStyle, StyledButton } from 'components/StatementBrowser/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import defaultProperties from 'constants/defaultProperties';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import SmartPropertyGuidelinesCheck from 'components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import { useState } from 'react';
import SmartPropertySuggestions from 'components/SmartSuggestions/SmartPropertySuggestions';
import { useSelector } from 'react-redux';

const AddPropertyView = ({
    inTemplate = false,
    newProperties = [],
    isDisabled = false,
    isLoading = false,
    showAddProperty,
    setShowAddProperty,
    handlePropertySelect,
    toggleConfirmNewProperty,
}) => {
    const [inputValue, setInputValue] = useState('');
    const properties = useSelector(state => state.statementBrowser.properties.byId);
    const propertyLabels = Object.values(properties).map(property => property.label);

    return (
        <AddPropertyStyle className={inTemplate ? 'inTemplate' : 'mt-3'}>
            <AddPropertyContentStyle
                onClick={() => (!isLoading && inTemplate && !showAddProperty && !isDisabled ? setShowAddProperty(true) : undefined)}
                className={`${inTemplate ? 'inTemplate' : 'noTemplate'} ${showAddProperty ? 'col-12 large' : ''}`}
            >
                {isLoading || !showAddProperty ? (
                    <ConditionalWrapper
                        condition={isDisabled}
                        wrapper={children => (
                            <Tippy content="This resource uses strict template">
                                <span>{children}</span>
                            </Tippy>
                        )}
                    >
                        <ButtonGroup>
                            <ButtonWithLoading
                                color={inTemplate ? 'light' : 'secondary'}
                                disabled={isDisabled || isLoading}
                                onClick={() => (!isLoading && !inTemplate ? setShowAddProperty(true) : undefined)}
                                style={inTemplate && isDisabled ? { opacity: '1', color: '#21252975' } : undefined}
                                size="sm"
                                isLoading={isLoading}
                            >
                                <Icon className="icon" size="sm" icon={faPlus} /> Add property
                            </ButtonWithLoading>
                            {!isDisabled && (
                                <SmartPropertySuggestions
                                    properties={propertyLabels}
                                    handleCreate={({ id, label }) => handlePropertySelect({ id, value: label })}
                                />
                            )}
                        </ButtonGroup>
                    </ConditionalWrapper>
                ) : (
                    <AddPropertyFormStyle>
                        <InputGroup size="sm">
                            <span className="input-group-text">
                                <Icon className="icon" icon={faPlus} />
                            </span>

                            <AutoComplete
                                entityType={ENTITIES.PREDICATE}
                                cssClasses="form-control-sm"
                                placeholder="Select or type to enter a property"
                                onItemSelected={handlePropertySelect}
                                onNewItemSelected={toggleConfirmNewProperty}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddProperty(false);
                                    }
                                }}
                                additionalData={newProperties}
                                disableBorderRadiusRight
                                allowCreate
                                defaultOptions={defaultProperties}
                                inputGroup={false}
                                inputId="addProperty"
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                            />
                            <SmartPropertyGuidelinesCheck label={inputValue} />
                            <StyledButton className="w-auto" outline onClick={() => setShowAddProperty(false)}>
                                Cancel
                            </StyledButton>
                        </InputGroup>
                    </AddPropertyFormStyle>
                )}
            </AddPropertyContentStyle>
        </AddPropertyStyle>
    );
};

AddPropertyView.propTypes = {
    inTemplate: PropTypes.bool,
    showAddProperty: PropTypes.bool.isRequired,
    setShowAddProperty: PropTypes.func.isRequired,
    handlePropertySelect: PropTypes.func.isRequired,
    toggleConfirmNewProperty: PropTypes.func.isRequired,
    newProperties: PropTypes.array,
    isDisabled: PropTypes.bool,
    isLoading: PropTypes.bool,
};

export default AddPropertyView;
