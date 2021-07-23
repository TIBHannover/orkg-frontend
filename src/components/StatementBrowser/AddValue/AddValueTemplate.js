import { useState, useRef, useEffect } from 'react';
import { InputGroup, InputGroupAddon, FormFeedback } from 'reactstrap';
import { fetchTemplatesOfClassIfNeeded, selectResource, createRequiredPropertiesInResource } from 'actions/statementBrowser';
import { StyledButton, ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import defaultDatatypes from 'components/Templates/helpers/defaultDatatypes';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import useToggle from './helpers/useToggle';
import validationSchema from './helpers/validationSchema';
import InputField from 'components/StatementBrowser/InputField/InputField';
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import ConfirmConversionTooltip from 'components/StatementBrowser/ConfirmConversionTooltip/ConfirmConversionTooltip';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import Tippy from '@tippyjs/react';
import { CLASSES, MISC, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

export default function AddValueTemplate(props) {
    const literalInputRef = useRef(null);
    const resourceInputRef = useRef(null);
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { classes, templates, openExistingResourcesInDialog } = statementBrowser;
    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const [entityType, setEntityType] = useState(getConfigByType(props.isLiteral ? MISC.DEFAULT_LITERAL_DATATYPE : 'object')._class);
    const [inputValue, setInputValue] = useState('');
    const [inputDataType, setInputDataType] = useState(getConfigByType(props.isLiteral ? MISC.DEFAULT_LITERAL_DATATYPE : 'object').type);
    const [showAddValue, setShowAddValue] = useToggle(false);
    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);
    const [templateIsLoading, setTemplateIsLoading] = useState(false); // to show loading indicator of the template if the value class has a template
    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);
    // uniqueLabel is set to true when it's a research problem
    const [uniqueLabel, setUniqueLabel] = useState(props.valueClass && props.valueClass.id === CLASSES.PROBLEM ? true : false);
    const [disabledCreate, setDisabledCreate] = useState(false);

    const [isInlineResource, setIsInlineResource] = useState(false);

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

    /* Select component reference can be used to check if menu is opened */
    const isMenuOpen = () => {
        return resourceInputRef.current.state.menuIsOpen && resourceInputRef.current.props.options.length > 0;
    };

    const getSchema = () => {
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
            return schema;
        } else {
            const config = getConfigByType(inputDataType);
            return config.schema;
        }
    };

    /**
     * Get the correct xsd datatype if it's literal
     */
    const getDataType = () => {
        if (props.valueClass && entityType === 'literal') {
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
            return getConfigByType(inputDataType).type;
        }
    };

    const onSubmit = () => {
        const { error } = getSchema().validate(inputValue);
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            //setInputValue(value);
            setFormFeedback(null);
            setIsValid(true);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(inputDataType, inputValue);
            if (suggestions.length > 0 && !props.valueClass) {
                console.log(suggestions);
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else {
                props.handleAddValue(entityType, inputValue, getDataType());
                setShowAddValue(false);
            }
        }
    };

    const acceptSuggestion = () => {
        confirmConversion.current.hide();
        props.handleAddValue(suggestionType._class, inputValue, suggestionType.type);
        setInputDataType(suggestionType.type);
        setShowAddValue(false);
    };

    const rejectSuggestion = () => {
        props.handleAddValue(entityType, inputValue, getDataType());
        setShowAddValue(false);
    };

    useEffect(() => {
        if (entityType === 'literal' && literalInputRef.current) {
            literalInputRef.current.focus();
        } else if (resourceInputRef.current && (entityType === 'object' || entityType === 'property')) {
            resourceInputRef.current.focus();
        }
    }, [entityType]);

    useEffect(() => {
        setFormFeedback(null);
        setIsValid(true);
        setEntityType(getConfigByType(inputDataType)._class);
        if (inputDataType === 'xsd:boolean') {
            setInputValue(v => Boolean(v).toString());
        }
    }, [inputDataType]);

    useEffect(() => {
        if (!showAddValue) {
            setInputValue('');
        }
    }, [showAddValue]);

    useEffect(() => {
        setInputDataType(getConfigByType(props.isLiteral ? MISC.DEFAULT_LITERAL_DATATYPE : 'object').type);
        setUniqueLabel(props.valueClass && props.valueClass.id === CLASSES.PROBLEM ? true : false);
        if (props.valueClass && !defaultDatatypes.map(t => t.id).includes(props.valueClass.id)) {
            setTemplateIsLoading(true);
            dispatch(fetchTemplatesOfClassIfNeeded(props.valueClass.id)).then(() => {
                if (classes[props.valueClass.id] && classes[props.valueClass.id].templateIds) {
                    const templateIds = classes[props.valueClass.id].templateIds;
                    //check if it's an inline resource
                    for (const templateId of templateIds) {
                        const template = templates[templateId];
                        if (template && template.hasLabelFormat) {
                            setTemplateIsLoading(false);
                            setIsInlineResource(template.label);
                        }
                        if (template && !template.isFetching) {
                            setTemplateIsLoading(false);
                        }
                    }
                    if (!classes[props.valueClass.id].isFetching) {
                        // in case there is no templates for the class
                        setTemplateIsLoading(false);
                    }
                }
            });
        } else {
            setTemplateIsLoading(false);
            setIsInlineResource(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);

    return (
        <ValueItemStyle className={showAddValue ? 'editingLabel' : ''}>
            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
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
                            if (isInlineResource && entityType !== 'literal') {
                                // is the valueType is literal, it's not possible to set it as an object of a statement
                                // 1 - create a resource
                                props.handleAddValue(entityType, isInlineResource).then(resourceId => {
                                    // 2 - open the dialog on that resource
                                    if (openExistingResourcesInDialog) {
                                        dispatch(
                                            createRequiredPropertiesInResource(resourceId).then(() => {
                                                setDialogResourceId(resourceId);
                                                setDialogResourceLabel(isInlineResource);
                                                setModal(true);
                                            })
                                        );
                                    } else {
                                        dispatch(
                                            selectResource({
                                                increaseLevel: true,
                                                resourceId: resourceId,
                                                label: isInlineResource,
                                                propertyLabel: props.predicate.label
                                            })
                                        );
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
                        {!props.valueClass && <DatatypeSelector valueType={inputDataType} setValueType={setInputDataType} />}
                        {entityType === 'object' ? (
                            <AutoComplete
                                entityType={ENTITIES.RESOURCE}
                                excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.TEMPLATE}`}
                                optionsClass={props.valueClass ? props.valueClass.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    props.handleValueSelect(entityType, i);
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
                                        props.handleAddValue(entityType, inputValue);
                                        setShowAddValue(false);
                                    }
                                }}
                                innerRef={ref => (resourceInputRef.current = ref)}
                                handleCreateExistingLabel={handleCreateExistingLabel}
                            />
                        ) : (
                            <>
                                <InputField
                                    valueClass={props.valueClass}
                                    inputValue={inputValue}
                                    setInputValue={setInputValue}
                                    inputDataType={inputDataType}
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
                            </>
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
                                disabled={!inputValue?.toString() || disabledCreate}
                                onClick={() => {
                                    onSubmit();
                                }}
                            >
                                {disabledCreate ? (
                                    <Tippy hideOnClick={false} content="Please use the existing research problem that has this label." arrow={true}>
                                        <span>Create</span>
                                    </Tippy>
                                ) : (
                                    <Tippy
                                        onCreate={instance => (confirmConversion.current = instance)}
                                        content={
                                            <ConfirmConversionTooltip
                                                rejectSuggestion={rejectSuggestion}
                                                acceptSuggestion={acceptSuggestion}
                                                suggestionType={suggestionType}
                                            />
                                        }
                                        interactive={true}
                                        trigger="manual"
                                        placement="top"
                                    >
                                        <span>Create</span>
                                    </Tippy>
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
    predicate: PropTypes.object,
    handleValueSelect: PropTypes.func.isRequired,
    newResources: PropTypes.array.isRequired,
    handleAddValue: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    isDisabled: PropTypes.bool,
    isLiteral: PropTypes.bool.isRequired,
    valueClass: PropTypes.object
};
