import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import SmartPropertyGuidelinesCheck from 'components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import SmartPropertySuggestions from 'components/SmartSuggestions/SmartPropertySuggestions';
import { AddPropertyContentStyle, AddPropertyFormStyle, AddPropertyStyle, StyledButton } from 'components/StatementBrowser/styled';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import defaultProperties from 'constants/defaultProperties';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ButtonGroup, InputGroup } from 'reactstrap';

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
    const properties = useSelector((state) => state.statementBrowser.properties.byId);
    const propertyLabels = Object.values(properties).map((property) => property.label);

    return (
        <AddPropertyStyle className={inTemplate ? 'inTemplate' : 'mt-3'}>
            <AddPropertyContentStyle
                onClick={() => (!isLoading && inTemplate && !showAddProperty && !isDisabled ? setShowAddProperty(true) : undefined)}
                className={`${inTemplate ? 'inTemplate' : 'noTemplate'} ${showAddProperty ? 'col-12 large' : ''}`}
            >
                {isLoading || !showAddProperty ? (
                    <ConditionalWrapper
                        condition={isDisabled}
                        wrapper={(children) => (
                            <Tippy content="This resource uses strict template">
                                <span>{children}</span>
                            </Tippy>
                        )}
                    >
                        <ButtonGroup className="d-flex">
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

                            <Autocomplete
                                entityType={ENTITIES.PREDICATE}
                                size="sm"
                                placeholder="Select or type to enter a property"
                                onChange={(value, { action }) => {
                                    if (action === 'select-option') {
                                        handlePropertySelect(value);
                                    } else if (action === 'create-option' && value) {
                                        toggleConfirmNewProperty(value.label);
                                    } else if (action === 'clear') {
                                        setInputValue('');
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddProperty(false);
                                    }
                                }}
                                defaultAdditional={newProperties}
                                allowCreate
                                autoFocus
                                defaultOptions={defaultProperties}
                                inputId="addProperty"
                                onInputChange={(newValue, actionMeta) => {
                                    if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                        setInputValue(newValue);
                                    }
                                }}
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
