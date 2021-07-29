import { useState, useRef, useEffect } from 'react';
import { InputGroup, InputGroupAddon, FormFeedback } from 'reactstrap';
import { StyledButton, ValueItemStyle } from 'components/StatementBrowser/styled';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import InputField from 'components/StatementBrowser/InputField/InputField';
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import ConfirmConversionTooltip from 'components/StatementBrowser/ConfirmConversionTooltip/ConfirmConversionTooltip';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import Tippy from '@tippyjs/react';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

export default function AddValueView(props) {
    const literalInputRef = useRef(null);
    const resourceInputRef = useRef(null);

    const [showAddValue, setShowAddValue] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);
    const [templateIsLoading] = useState(false); // to show loading indicator of the template if the value class has a template
    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);
    const [disabledCreate, setDisabledCreate] = useState(false);

    const handleCreateExistingLabel = (inputValue, selectOptions) => {
        //check if label exists
        if (
            props.isUniqLabel &&
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

    const onSubmit = () => {
        const { error } = props.schema.validate(props.inputValue);
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            //setInputValue(value);
            setFormFeedback(null);
            setIsValid(true);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(props.inputDataType, props.inputValue);
            if (suggestions.length > 0 && !props.valueClass) {
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else {
                props.handleAddValue(props.entityType, { label: props.inputValue, datatype: props.getDataType() });
                setShowAddValue(false);
            }
        }
    };

    const acceptSuggestion = () => {
        confirmConversion.current.hide();
        props.handleAddValue(suggestionType._class, { label: props.inputValue, datatype: suggestionType.type });
        props.setInputDataType(suggestionType.type);
        setShowAddValue(false);
    };

    const rejectSuggestion = () => {
        props.handleAddValue(props.entityType, { label: props.inputValue, datatype: props.getDataType() });
        setShowAddValue(false);
    };

    useEffect(() => {
        if (props.entityType === 'literal' && literalInputRef.current) {
            literalInputRef.current.focus();
        } else if (resourceInputRef.current && (props.entityType === ENTITIES.RESOURCE || props.entityType === 'property')) {
            resourceInputRef.current.focus();
        }
    }, [props.entityType]);

    useEffect(() => {
        setFormFeedback(null);
        setIsValid(true);
        props.setEntityType(getConfigByType(props.inputDataType)._class);
        if (props.inputDataType === 'xsd:boolean') {
            props.setInputValue(v => Boolean(v).toString());
        }
    }, [props, props.inputDataType]);

    useEffect(() => {
        if (!showAddValue) {
            props.setInputValue('');
        }
    }, [props, showAddValue]);

    return (
        <ValueItemStyle className={showAddValue ? 'editingLabel' : ''}>
            {!showAddValue ? (
                !templateIsLoading ? ( //Show loading indicator if the template is still loading
                    <StatementOptionButton
                        isDisabled={props.isDisabled}
                        title={!props.isDisabled ? 'Add value' : 'This property reached the maximum number of values set by template'}
                        icon={faPlus}
                        action={() => {
                            if (props.isBlankNode && props.entityType !== ENTITIES.LITERAL) {
                                props.createBlankNode(props.entityType);
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
                        {!props.valueClass && <DatatypeSelector valueType={props.inputDataType} setValueType={props.setInputDataType} />}
                        {props.entityType === ENTITIES.RESOURCE ? (
                            <AutoComplete
                                entityType={ENTITIES.RESOURCE}
                                excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.TEMPLATE}`}
                                optionsClass={props.valueClass ? props.valueClass.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    props.handleAddValue(props.entityType, { ...i, label: i.value });
                                    setShowAddValue(false);
                                }}
                                onInput={(e, value) => props.setInputValue(e ? e.target.value : value)}
                                value={props.inputValue}
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
                                        props.handleAddValue(props.entityType, { label: props.inputValue });
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
                                    inputValue={props.inputValue}
                                    setInputValue={props.setInputValue}
                                    inputDataType={props.inputDataType}
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
                                disabled={!props.inputValue?.toString() || disabledCreate}
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

AddValueView.propTypes = {
    newResources: PropTypes.array.isRequired,
    handleAddValue: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    valueClass: PropTypes.object,
    isBlankNode: PropTypes.string.isRequired,
    isUniqLabel: PropTypes.bool,
    createBlankNode: PropTypes.func,
    inputDataType: PropTypes.string,
    inputValue: PropTypes.string,
    entityType: PropTypes.string,
    setInputDataType: PropTypes.func,
    setEntityType: PropTypes.func,
    setInputValue: PropTypes.func,
    schema: PropTypes.object,
    getDataType: PropTypes.func
};
