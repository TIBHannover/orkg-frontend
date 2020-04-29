import React, { useState, useRef, useEffect } from 'react';
import { resourcesUrl } from 'network';
import { Input, InputGroup, InputGroupAddon, DropdownMenu, InputGroupButtonDropdown, FormFeedback } from 'reactstrap';
import { StyledDropdownItem, StyledButton, StyledDropdownToggle, ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import useTogggle from './helpers/useToggle';
import validationSchema from './helpers/validationSchema';
import PropTypes from 'prop-types';

export default function AddValueTemplate(props) {
    const literalInputRef = useRef(null);
    const resourceInputRef = useRef(null);

    // Get the typing
    let isLiteral = false;
    for (const typeId of props.typeComponents.map(tc => tc.value.id)) {
        if (defaultDatatypes.map(t => t.id).includes(typeId)) {
            isLiteral = true;
            break;
        }
    }
    //const isLiteral = props.predicate.templateClass && defaultDatatypes.map(t => t.id).includes(props.predicate.templateClass.id) ? true : false;
    const isTyped =
        props.typeComponents && props.typeComponents.length > 0 && props.typeComponents[0].value && props.typeComponents[0].value.id ? true : false;
    // get value type (valueClassType == templateClass)

    const valueClassType =
        props.typeComponents && props.typeComponents.length > 0 && props.typeComponents[0].value && props.typeComponents[0].value.id
            ? props.typeComponents[0].value
            : null;

    const [isInlineForm, setIsInlineForm] = useState(false);
    const [tempateNodeLabel, setTempateNodeLabel] = useState([]);
    if (valueClassType && !defaultDatatypes.map(t => t.id).includes(valueClassType.id)) {
        props.fetchTemplatesofClassIfNeeded(valueClassType.id).then(() => {
            if (props.classes[valueClassType.id] && props.classes[valueClassType.id].templateIds) {
                const templateIds = props.classes[valueClassType.id].templateIds;
                //check if it's an inline resource
                for (const templateId of templateIds) {
                    const template = props.templates[templateId];
                    if (template && template.hasLabelFormat) {
                        setTempateNodeLabel(template.label);
                        setIsInlineForm(true);
                    }
                }
            }

            // get the list of components and check if it's an inline resource
        });
    }

    let inputFormType = 'text';
    if (isTyped) {
        switch (valueClassType.id) {
            case 'Date':
                inputFormType = 'date';
                break;
            default:
                inputFormType = 'text';
                break;
        }
    }

    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const [valueType, setValueType] = useState(isLiteral ? 'literal' : 'object');
    const [inputValue, setInputValue] = useState('');
    const [dropdownValueTypeOpen, setDropdownValueTypeOpen] = useTogggle(false);
    const [showAddValue, setShowAddValue] = useTogggle(false);
    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);

    useEffect(() => {
        if (valueType === 'literal' && literalInputRef.current) {
            literalInputRef.current.focus();
        } else if (resourceInputRef.current && (valueType === 'object' || valueType === 'property')) {
            resourceInputRef.current.focus();
        }
    }, [valueType]);

    useEffect(() => {
        if (!showAddValue) {
            setInputValue('');
        }
    }, [showAddValue]);

    /* Select component reference can be used to check if menu is opened */
    const isMenuOpen = () => {
        return resourceInputRef.current.select.state.menuIsOpen && resourceInputRef.current.state.loadedOptions.length > 0;
    };

    const validateValue = () => {
        if (valueClassType && ['Date', 'Number', 'String'].includes(valueClassType.id)) {
            const schema = validationSchema(props.typeComponents[0]);
            const { error, value } = schema.validate(inputValue);
            if (error) {
                setFormFeedback(error.message);
                setIsValid(false);
                return false;
            } else {
                setInputValue(value);
                setFormFeedback(null);
                return value;
            }
        } else {
            setFormFeedback(null);
            return inputValue;
        }
    };

    const onSubmit = () => {
        const validatedValue = validateValue();
        if (validatedValue !== false) {
            props.handleAddValue(valueType, inputValue);
            setShowAddValue(false);
        }
    };

    return (
        <ValueItemStyle className={showAddValue ? 'editingLabel' : ''}>
            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    resourceId={dialogResourceId}
                    resourceLabel={dialogResourceLabel}
                    newStore={false}
                    enableEdit={true}
                />
            ) : (
                ''
            )}
            {!showAddValue ? (
                <StatementOptionButton
                    isDisabled={props.isDisabled}
                    title={!props.isDisabled ? 'Add value' : 'This property reached the maximum number of values set by template'}
                    icon={faPlus}
                    action={() => {
                        if (isInlineForm) {
                            // 1 - create a resource
                            props.handleAddValue(valueType, tempateNodeLabel).then(resourceId => {
                                // 2 - open the dialog on that resource
                                if (props.openExistingResourcesInDialog) {
                                    setDialogResourceId(resourceId);
                                    setDialogResourceLabel(tempateNodeLabel);
                                    setModal(true);
                                } else {
                                    props.selectResource({
                                        increaseLevel: true,
                                        resourceId: resourceId,
                                        label: tempateNodeLabel
                                    });
                                }
                            });
                        } else {
                            setShowAddValue(true);
                        }
                    }}
                />
            ) : (
                <div>
                    <InputGroup size="sm">
                        {!isTyped && (
                            <InputGroupButtonDropdown addonType="prepend" isOpen={dropdownValueTypeOpen} toggle={setDropdownValueTypeOpen}>
                                <StyledDropdownToggle>
                                    <small>{valueType.charAt(0).toUpperCase() + valueType.slice(1) + ' '}</small>
                                    <Icon size="xs" icon={faBars} />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => setValueType('object')}>
                                        <Tippy content="Choose object to link this to an object, which can contain values on its own">
                                            <span>Object</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => setValueType('literal')}>
                                        <Tippy content="Choose literal for values like numbers or plain text">
                                            <span>Literal</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        )}
                        {valueType === 'object' ? (
                            <AutoComplete
                                requestUrl={resourcesUrl}
                                excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM},${process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}`}
                                optionsClass={valueClassType ? valueClassType.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    props.handleValueSelect(valueType, i);
                                    setShowAddValue(false);
                                }}
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                                additionalData={props.newResources}
                                disableBorderRadiusRight
                                disableBorderRadiusLeft={!isTyped}
                                cssClasses={'form-control-sm'}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddValue(false);
                                    } else if (e.keyCode === 13 && !isMenuOpen()) {
                                        props.handleAddValue(valueType, inputValue);
                                        setShowAddValue(false);
                                    }
                                }}
                                innerRef={ref => (resourceInputRef.current = ref)}
                            />
                        ) : (
                            <Input
                                placeholder="Enter a value"
                                name="literalValue"
                                type={inputFormType}
                                bsSize="sm"
                                value={inputValue}
                                onChange={(e, value) => setInputValue(e ? e.target.value : value)}
                                innerRef={literalInputRef}
                                invalid={!isValid}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddValue(false);
                                    } else if (e.keyCode === 13) {
                                        onSubmit();
                                    }
                                }}
                            />
                        )}
                        <InputGroupAddon addonType="append">
                            <StyledButton
                                outline
                                onClick={() => {
                                    setShowAddValue(false);
                                    setIsValid(true);
                                    setFormFeedback(null);
                                }}
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton
                                outline
                                onClick={() => {
                                    onSubmit();
                                }}
                            >
                                Create
                            </StyledButton>
                        </InputGroupAddon>
                    </InputGroup>
                    {!isValid && <FormFeedback className={'d-block'}>{formFeedback}</FormFeedback>}
                </div>
            )}
        </ValueItemStyle>
    );
}

AddValueTemplate.propTypes = {
    predicate: PropTypes.object.isRequired,
    handleValueSelect: PropTypes.func.isRequired,
    newResources: PropTypes.array.isRequired,
    handleAddValue: PropTypes.func.isRequired,
    fetchTemplatesofClassIfNeeded: PropTypes.func.isRequired,
    typeComponents: PropTypes.array.isRequired,
    templates: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    selectResource: PropTypes.func.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    isDisabled: PropTypes.bool
};
