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

const AddPropertyView = props => {
    const [inputValue, setInputValue] = useState('');
    const properties = useSelector(state => state.statementBrowser.properties.byId);
    const propertyLabels = Object.values(properties).map(property => property.label);

    return (
        <AddPropertyStyle className={props.inTemplate ? 'inTemplate' : 'mt-3'}>
            <AddPropertyContentStyle
                onClick={() =>
                    !props.isLoading && props.inTemplate && !props.showAddProperty && !props.isDisabled ? props.setShowAddProperty(true) : undefined
                }
                className={`${props.inTemplate ? 'inTemplate' : 'noTemplate'} ${props.showAddProperty ? 'col-12 large' : ''}`}
            >
                {props.isLoading || !props.showAddProperty ? (
                    <ConditionalWrapper
                        condition={props.isDisabled}
                        wrapper={children => (
                            <Tippy content="This resource uses strict template">
                                <span>{children}</span>
                            </Tippy>
                        )}
                    >
                        <ButtonGroup>
                            <ButtonWithLoading
                                color={props.inTemplate ? 'light' : 'secondary'}
                                disabled={props.isDisabled || props.isLoading}
                                onClick={() => (!props.isLoading && !props.inTemplate ? props.setShowAddProperty(true) : undefined)}
                                style={props.inTemplate && props.isDisabled ? { opacity: '1', color: '#21252975' } : undefined}
                                size="sm"
                                isLoading={props.isLoading}
                            >
                                <Icon className="icon" size="sm" icon={faPlus} /> Add property
                            </ButtonWithLoading>
                            <SmartPropertySuggestions
                                disabled={props.isDisabled}
                                properties={propertyLabels}
                                handleCreate={({ id, label }) => props.handlePropertySelect({ id, value: label })}
                            />
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
                                onItemSelected={props.handlePropertySelect}
                                onNewItemSelected={props.toggleConfirmNewProperty}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        props.setShowAddProperty(false);
                                    }
                                }}
                                additionalData={props.newProperties}
                                disableBorderRadiusRight
                                allowCreate
                                defaultOptions={defaultProperties}
                                inputGroup={false}
                                inputId="addProperty"
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                            />
                            <SmartPropertyGuidelinesCheck label={inputValue} />
                            <StyledButton className="w-auto" outline onClick={() => props.setShowAddProperty(false)}>
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

AddPropertyView.defaultProps = {
    inTemplate: false,
    newProperties: [],
    isDisabled: false,
    isLoading: false,
};

export default AddPropertyView;
