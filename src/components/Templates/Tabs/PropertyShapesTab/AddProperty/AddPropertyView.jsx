import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { ButtonGroup, InputGroup } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartPropertyGuidelinesCheck from '@/components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import SmartPropertySuggestions from '@/components/SmartSuggestions/SmartPropertySuggestions';
import { AddPropertyContentStyle, AddPropertyFormStyle, AddPropertyStyle, StyledButton } from '@/components/StatementBrowser/styled';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import defaultProperties from '@/constants/defaultProperties';
import { ENTITIES } from '@/constants/graphSettings';

const AddPropertyView = ({
    isDisabled = false,
    isLoading = false,
    showAddProperty,
    setShowAddProperty,
    handlePropertySelect,
    toggleConfirmNewProperty,
}) => {
    const [inputValue, setInputValue] = useState('');
    const propertyLabels = [];

    return (
        <AddPropertyStyle className="mt-3">
            <AddPropertyContentStyle className={`noTemplate ${showAddProperty ? 'col-12 large' : ''}`}>
                {isLoading || !showAddProperty ? (
                    <ConditionalWrapper
                        condition={isDisabled}
                        wrapper={(children) => (
                            <Tooltip content="This resource uses strict template">
                                <span>{children}</span>
                            </Tooltip>
                        )}
                    >
                        <ButtonGroup className="d-flex">
                            <ButtonWithLoading
                                color="secondary"
                                disabled={isDisabled || isLoading}
                                onClick={() => setShowAddProperty(true)}
                                style={isDisabled ? { opacity: '1', color: '#21252975' } : undefined}
                                size="sm"
                                isLoading={isLoading}
                            >
                                <FontAwesomeIcon className="icon" size="sm" icon={faPlus} /> Add property
                            </ButtonWithLoading>
                            {!isDisabled && (
                                <SmartPropertySuggestions
                                    properties={propertyLabels}
                                    handleCreate={({ id, label }) => handlePropertySelect({ id, label })}
                                />
                            )}
                        </ButtonGroup>
                    </ConditionalWrapper>
                ) : (
                    <AddPropertyFormStyle>
                        <InputGroup size="sm">
                            <span className="input-group-text">
                                <FontAwesomeIcon className="icon" icon={faPlus} />
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
    showAddProperty: PropTypes.bool.isRequired,
    setShowAddProperty: PropTypes.func.isRequired,
    handlePropertySelect: PropTypes.func.isRequired,
    toggleConfirmNewProperty: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    isLoading: PropTypes.bool,
};

export default AddPropertyView;
