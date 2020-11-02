import React, { useState, useRef, useEffect } from 'react';
import { resourcesUrl } from 'services/backend/resources';
import { InputGroup, InputGroupAddon, DropdownMenu, InputGroupButtonDropdown, FormFeedback } from 'reactstrap';
import { StyledDropdownItem, StyledButton, StyledDropdownToggle, ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import useTogggle from './helpers/useToggle';
import validationSchema from './helpers/validationSchema';
import InputField from 'components/StatementBrowser/InputField/InputField';
import PropTypes from 'prop-types';
import { CLASSES, MISC } from 'constants/graphSettings';

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
    const [uniqueLabel, setuniqueLabel] = useState(props.valueClass && props.valueClass.id === CLASSES.PROBLEM ? true : false);
    const [disabledCreate, setDisabledCreate] = useState(false);

    const handleCreateExistingLabel = (inputValue, selectOptions) => {
        //check if label exists
        if (
            uniqueLabel &&
            inputValue &&
            selectOptions
                .map(s =>
                    String(s.label)
                        .trim()
                        .toLowerCase()
                )
                .includes(
                    String(inputValue)
                        .trim()
                        .toLowerCase()
                )
        ) {
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
        setuniqueLabel(props.valueClass && props.valueClass.id === CLASSES.PROBLEM ? true : false);
    }, [props.valueClass]);

    useEffect(() => {
        if (!showAddValue) {
            setInputValue('');
        }
    }, [showAddValue]);

    /* Select component reference can be used to check if menu is opened */
    const isMenuOpen = () => {
        return resourceInputRef.current.state.menuIsOpen && resourceInputRef.current.props.options.length > 0;
    };

    const validateValue = () => {
        if (props.valueClass && ['Date', 'Number', 'String'].includes(props.valueClass.id)) {
            let component;
            if (props.components && props.components.length > 0) {
                component = props.components[0];
            }
            if (!component) {
                component = {
                    value: props.valueClass,
                    property: { id: props.predicate.id, label: props.predicate.label },
                    validationRules: props.predicate.validationRules
                };
            }
            const schema = validationSchema(component);
            const { error, value } = schema.validate(inputValue);
            if (error) {
                setFormFeedback(error.message);
                setIsValid(false);
                return false;
            } else {
                setInputValue(value);
                setFormFeedback(null);
                setIsValid(true);
                return value;
            }
        } else {
            setFormFeedback(null);
            setIsValid(true);
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
                    return MISC.DEFAULT_LITERAL_DATATYPE;
                case 'Number':
                    return 'xsd:decimal';
                case 'Date':
                    return 'xsd:date';
                default:
                    return MISC.DEFAULT_LITERAL_DATATYPE;
            }
        } else {
            return MISC.DEFAULT_LITERAL_DATATYPE;
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

    const resourceTooltip = (
        <>
            Choose resource to link this to a resource which can contain values on its own. <br /> To fetch an existing resource by ID type “#”
            without quotes following with the resource ID (e.g: #R12).
        </>
    );
    const literalTooltip = 'Choose literal for values like numbers, plain text or mathematical expressions using TeX delimiters $$...$$';

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
                                            label: isInlineResource,
                                            propertyLabel: props.predicate.label
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
                                <StyledDropdownToggle disableBorderRadiusRight={true}>
                                    <Tippy content={valueType === 'object' ? resourceTooltip : literalTooltip}>
                                        <small>{valueType === 'object' ? 'Resource' : 'Literal'} </small>
                                    </Tippy>
                                    <Icon size="xs" icon={faBars} />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => setValueType('object')}>
                                        <Tippy content={resourceTooltip}>
                                            <span>Resource</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => setValueType('literal')}>
                                        <Tippy content={literalTooltip}>
                                            <span>Literal</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        )}
                        {valueType === 'object' ? (
                            <AutoComplete
                                requestUrl={resourcesUrl}
                                excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.CONTRIBUTION_TEMPLATE}`}
                                optionsClass={props.valueClass ? props.valueClass.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    props.handleValueSelect(valueType, i);
                                    setShowAddValue(false);
                                }}
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                                additionalData={props.newResources}
                                autoLoadOption={props.valueClass ? true : false}
                                openMenuOnFocus={true}
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
                                disabled={!inputValue || disabledCreate}
                                onClick={() => {
                                    onSubmit();
                                }}
                            >
                                {disabledCreate ? (
                                    <Tippy hideOnClick={false} content="Please use the existing research problem that has this label." arrow={true}>
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
