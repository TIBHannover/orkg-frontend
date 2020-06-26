import React, { useState, useRef, useEffect } from 'react';
import { resourcesUrl } from 'network';
import { InputGroup, InputGroupAddon, DropdownMenu, InputGroupButtonDropdown, FormFeedback } from 'reactstrap';
import { StyledDropdownItem, StyledButton, StyledDropdownToggle, ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import useTogggle from './helpers/useToggle';
import validationSchema from './helpers/validationSchema';
import InputField from 'components/StatementBrowser/InputField/InputField';
import PropTypes from 'prop-types';

export default function AddValueTemplate(props) {
    const literalInputRef = useRef(null);
    const resourceInputRef = useRef(null);

    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const [valueType, setValueType] = useState(props.isLiteral ? 'literal' : 'object');
    const [inputValue, setInputValue] = useState('');
    const [dropdownValueTypeOpen, setDropdownValueTypeOpen] = useTogggle(false);
    const [showAddValue, setShowAddValue] = useTogggle(false);
    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);
    const [templateIsLoading, setTemplateIsLoading] = useState(false); // to show loading indicator of the template if the value class has a template

    // uniqueLabel is set to true when it's a research problem
    const [uniqueLabel, setuniqueLabel] = useState(props.valueClass && props.valueClass.id === process.env.REACT_APP_CLASSES_PROBLEM ? true : false);
    const [disabledCreate, setDisabledCreate] = useState(false);

    const handleCreateExistingLabel = (inputValue, selectOptions) => {
        //check if label exists
        if (uniqueLabel && inputValue && selectOptions.map(s => s.label.toLowerCase()).includes(inputValue.toLowerCase())) {
            setDisabledCreate(true);
        } else {
            setDisabledCreate(false);
        }
    };

    useEffect(() => {
        if (valueType === 'literal' && literalInputRef.current) {
            literalInputRef.current.focus();
        } else if (resourceInputRef.current && (valueType === 'object' || valueType === 'property')) {
            resourceInputRef.current.focus();
        }
    }, [valueType]);

    useEffect(() => {
        setValueType(props.isLiteral ? 'literal' : 'object');
    }, [props.isLiteral]);

    useEffect(() => {
        setuniqueLabel(props.valueClass && props.valueClass.id === process.env.REACT_APP_CLASSES_PROBLEM ? true : false);
    }, [props.valueClass]);

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
        if (props.valueClass && ['Date', 'Number', 'String'].includes(props.valueClass.id)) {
            const schema = validationSchema(props.components[0]);
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

    /**
     * Get the correct xsd datatype if it's literal
     */
    const getDataType = () => {
        if (props.valueClass && valueType === 'literal') {
            switch (props.valueClass.id) {
                case 'String':
                    return process.env.REACT_APP_DEFAULT_LITERAL_DATATYPE;
                case 'Number':
                    return 'xsd:decimal';
                case 'Date':
                    return 'xsd:date';
                default:
                    return process.env.REACT_APP_DEFAULT_LITERAL_DATATYPE;
            }
        } else {
            return process.env.REACT_APP_DEFAULT_LITERAL_DATATYPE;
        }
    };

    const onSubmit = () => {
        const validatedValue = validateValue();
        if (validatedValue !== false) {
            props.handleAddValue(valueType, inputValue, getDataType());
            setShowAddValue(false);
        }
    };

    const [isInlineResource, setIsInlineResource] = useState(false);

    useEffect(() => {
        if (props.valueClass && !defaultDatatypes.map(t => t.id).includes(props.valueClass.id)) {
            setTemplateIsLoading(true);
            props.fetchTemplatesofClassIfNeeded(props.valueClass.id).then(() => {
                if (props.classes[props.valueClass.id] && props.classes[props.valueClass.id].templateIds) {
                    const templateIds = props.classes[props.valueClass.id].templateIds;
                    //check if it's an inline resource
                    for (const templateId of templateIds) {
                        const template = props.templates[templateId];
                        if (template && template.hasLabelFormat) {
                            setTemplateIsLoading(false);
                            setIsInlineResource(template.label);
                        }
                        if (template && !template.isFetching) {
                            setTemplateIsLoading(false);
                        }
                    }
                    if (!props.classes[props.valueClass.id].isFetching) {
                        // in case there is no templates for the class
                        setTemplateIsLoading(false);
                    }
                }
            });
        } else {
            setTemplateIsLoading(false);
            setIsInlineResource(false);
        }
    }, [props]);

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
                !templateIsLoading ? ( //Show loading indicator if the template is still loading
                    <StatementOptionButton
                        isDisabled={props.isDisabled}
                        title={!props.isDisabled ? 'Add value' : 'This property reached the maximum number of values set by template'}
                        icon={faPlus}
                        action={() => {
                            if (isInlineResource && valueType !== 'literal') {
                                // is the valueType is literal, it's not possible to set it as an object of a statement
                                // 1 - create a resource
                                props.handleAddValue(valueType, isInlineResource).then(resourceId => {
                                    // 2 - open the dialog on that resource
                                    if (props.openExistingResourcesInDialog) {
                                        props.createRequiredPropertiesInResource(resourceId).then(() => {
                                            setDialogResourceId(resourceId);
                                            setDialogResourceLabel(isInlineResource);
                                            setModal(true);
                                        });
                                    } else {
                                        props.selectResource({
                                            increaseLevel: true,
                                            resourceId: resourceId,
                                            label: isInlineResource
                                        });
                                    }
                                });
                            } else {
                                setShowAddValue(true);
                            }
                        }}
                    />
                ) : (
                    <span>
                        <Icon icon={faSpinner} spin />
                    </span>
                )
            ) : (
                <div>
                    <InputGroup size="sm">
                        {!props.valueClass && (
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
                                optionsClass={props.valueClass ? props.valueClass.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    props.handleValueSelect(valueType, i);
                                    setShowAddValue(false);
                                }}
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                                additionalData={props.newResources}
                                disableBorderRadiusRight
                                disableBorderRadiusLeft={!props.valueClass}
                                cssClasses="form-control-sm"
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
                                handleCreateExistingLabel={handleCreateExistingLabel}
                            />
                        ) : (
                            <InputField
                                components={props.components}
                                valueClass={props.valueClass}
                                inputValue={inputValue}
                                setInputValue={setInputValue}
                                setShowAddValue={setShowAddValue}
                                onSubmit={onSubmit}
                                isValid={isValid}
                                literalInputRef={literalInputRef}
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
                                disabled={disabledCreate}
                                onClick={() => {
                                    onSubmit();
                                }}
                            >
                                {disabledCreate ? (
                                    <Tippy content="Please use the existing research problem that has this label." arrow={true}>
                                        <span>Create</span>
                                    </Tippy>
                                ) : (
                                    'Create'
                                )}
                            </StyledButton>
                        </InputGroupAddon>
                    </InputGroup>
                    {!isValid && <FormFeedback className="d-block">{formFeedback}</FormFeedback>}
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
    components: PropTypes.array.isRequired,
    templates: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    selectResource: PropTypes.func.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    createRequiredPropertiesInResource: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    isLiteral: PropTypes.bool.isRequired,
    valueClass: PropTypes.object
};
