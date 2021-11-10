import { InputGroupAddon, Button, InputGroup } from 'reactstrap';
import { AddPropertyStyle, AddPropertyContentStyle, AddPropertyFormStyle, StyledButton } from 'components/StatementBrowser/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import defaultProperties from 'constants/defaultProperties';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const AddPropertyView = props => {
    return (
        <AddPropertyStyle className={props.inTemplate ? 'inTemplate' : 'mt-3'}>
            <AddPropertyContentStyle
                onClick={() => (!props.isLoading && props.inTemplate && !props.showAddProperty ? props.setShowAddProperty(true) : undefined)}
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
                        <Button
                            color={props.inTemplate ? 'light' : 'secondary'}
                            disabled={props.isDisabled || props.isLoading}
                            onClick={() => (!props.isLoading && !props.inTemplate ? props.setShowAddProperty(true) : undefined)}
                            style={props.inTemplate && props.isDisabled ? { opacity: '1', color: '#21252975' } : undefined}
                            size="sm"
                        >
                            {props.isLoading && (
                                <>
                                    <Icon icon={faSpinner} spin /> Loading
                                </>
                            )}
                            {!props.isLoading && (
                                <>
                                    <Icon className="icon" size="sm" icon={faPlus} /> Add property
                                </>
                            )}
                        </Button>
                    </ConditionalWrapper>
                ) : (
                    <AddPropertyFormStyle>
                        <InputGroup size="sm">
                            <InputGroupAddon addonType="prepend">
                                <Icon className="icon" icon={faPlus} />
                            </InputGroupAddon>
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
                            />
                            <InputGroupAddon addonType="append">
                                <StyledButton outline onClick={() => props.setShowAddProperty(false)}>
                                    Cancel
                                </StyledButton>
                            </InputGroupAddon>
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
    isLoading: PropTypes.bool
};

AddPropertyView.defaultProps = {
    inTemplate: false,
    newProperties: [],
    isDisabled: false,
    isLoading: false
};

export default AddPropertyView;
