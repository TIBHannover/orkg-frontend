import { useState, useRef, useEffect } from 'react';
import { InputGroup, FormFeedback } from 'reactstrap';
import { toggleEditValue } from 'slices/statementBrowserSlice';
import { StyledButton } from 'components/StatementBrowser/styled';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import InputField from 'components/StatementBrowser/InputField/InputField';
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import a from 'indefinite';
import { useDispatch } from 'react-redux';
import ConfirmationTooltip from 'components/StatementBrowser/ConfirmationTooltip/ConfirmationTooltip';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import Tippy from '@tippyjs/react';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import useValueForm from './hooks/useValueForm';

const ValueForm = props => {
    const editMode = Boolean(props.id);
    const {
        value,
        valueClass,
        inputDataType,
        inputValue,
        entityType,
        schema,
        setInputDataType,
        setEntityType,
        setInputValue,
        handleAddValue,
        getDataType,
        newResources,
        disabledCreate,
        handleCreateExistingLabel,
        commitChangeLabel,
    } = useValueForm({
        valueId: props.id,
        resourceId: props.resourceId,
        propertyId: props.propertyId,
        syncBackend: props.syncBackend,
    });

    const dispatch = useDispatch();

    const literalInputRef = useRef(null);
    const autocompleteInputRef = useRef(null);
    const confirmButtonRef = useRef(null);

    const onShown = () => {
        confirmButtonRef.current.focus();
    };

    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);
    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);

    /* Select component reference can be used to check if menu is opened */
    const isMenuOpen = () => autocompleteInputRef.current.state.menuIsOpen && autocompleteInputRef.current.props.options.length > 0;

    const onSubmit = () => {
        const { error } = schema.validate(inputValue);
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            // setInputValue(value);
            setFormFeedback(null);
            setIsValid(true);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(inputDataType, inputValue);
            if (suggestions.length > 0 && !valueClass) {
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else if (!editMode) {
                handleAddValue(entityType, { label: inputValue, datatype: getDataType() });
                props.setShowAddValue?.(false);
            } else {
                commitChangeLabel(inputValue, getDataType(inputDataType));
                dispatch(toggleEditValue({ id: props.id }));
            }
        }
    };

    const acceptSuggestion = () => {
        if (!editMode) {
            handleAddValue(suggestionType._class, { label: inputValue, datatype: suggestionType.type });
            setInputDataType(suggestionType.type);
            props.setShowAddValue?.(false);
        } else {
            confirmConversion.current.hide();
            commitChangeLabel(inputValue, suggestionType.type);
            setInputDataType(suggestionType.type);
            dispatch(toggleEditValue({ id: props.id }));
        }
    };

    const rejectSuggestion = () => {
        if (!editMode) {
            handleAddValue(entityType, { label: inputValue, datatype: getDataType() });
            props.setShowAddValue?.(false);
        } else {
            commitChangeLabel(inputValue, getDataType(inputDataType));
            dispatch(toggleEditValue({ id: props.id }));
        }
    };

    useEffect(() => {
        if (entityType === ENTITIES.LITERAL && literalInputRef.current) {
            literalInputRef.current.focus();
        } else if (autocompleteInputRef.current && (entityType === ENTITIES.RESOURCE || entityType === ENTITIES.PREDICATE)) {
            autocompleteInputRef.current.focus();
        }
    }, [entityType]);

    useEffect(() => {
        setFormFeedback(null);
        setIsValid(true);
        setEntityType(getConfigByType(inputDataType)._class);
        if (inputDataType === 'xsd:boolean') {
            setInputValue(v => Boolean(v === 'true').toString());
        }
    }, [inputDataType, setEntityType, setInputValue]);

    return (
        <div>
            <InputGroup size="sm">
                {((!editMode && !valueClass) || (editMode && !valueClass && value._class === ENTITIES.LITERAL)) && (
                    <DatatypeSelector entity={editMode ? value._class : null} valueType={inputDataType} setValueType={setInputDataType} />
                )}
                {!editMode && entityType !== ENTITIES.LITERAL ? (
                    <AutoComplete
                        entityType={entityType}
                        excludeClasses={
                            entityType === ENTITIES.RESOURCE && valueClass ? `${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.TEMPLATE}` : null
                        }
                        optionsClass={entityType === ENTITIES.RESOURCE && valueClass ? valueClass.id : undefined}
                        placeholder={`Enter a ${entityType}`}
                        onItemSelected={i => {
                            handleAddValue(entityType, { ...i, label: i.value, selected: true });
                            props.setShowAddValue?.(false);
                        }}
                        ols={entityType === ENTITIES.CLASS}
                        onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                        value={inputValue}
                        additionalData={newResources}
                        autoLoadOption={!!valueClass}
                        openMenuOnFocus={true}
                        disableBorderRadiusRight
                        disableBorderRadiusLeft={!valueClass}
                        cssClasses="form-control-sm"
                        onKeyDown={e => {
                            if (e.keyCode === 27) {
                                // escape
                                props.setShowAddValue?.(false);
                            } else if (e.keyCode === 13 && !isMenuOpen()) {
                                handleAddValue(entityType, { label: inputValue, selected: true });
                                props.setShowAddValue?.(false);
                            }
                        }}
                        innerRef={ref => (autocompleteInputRef.current = ref)}
                        handleCreateExistingLabel={handleCreateExistingLabel}
                    />
                ) : (
                    <InputField
                        valueClass={valueClass}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        inputDataType={inputDataType}
                        isValid={isValid}
                        literalInputRef={literalInputRef}
                        onKeyDown={e => {
                            if (e.keyCode === 27) {
                                // escape
                                props.setShowAddValue?.(false);
                            } else if (e.keyCode === 13) {
                                onSubmit();
                            }
                        }}
                    />
                )}

                <StyledButton
                    outline
                    onClick={() => {
                        if (!editMode) {
                            props.setShowAddValue?.(false);
                        } else {
                            dispatch(toggleEditValue({ id: props.id }));
                        }
                        setIsValid(true);
                        setFormFeedback(null);
                    }}
                >
                    Cancel
                </StyledButton>
                <StyledButton outline disabled={!inputValue?.toString() || disabledCreate} onClick={() => onSubmit()}>
                    {disabledCreate ? (
                        <Tippy hideOnClick={false} content="Please use the existing research problem that has this label." arrow={true}>
                            <span>Create</span>
                        </Tippy>
                    ) : (
                        <Tippy
                            onShown={onShown}
                            onCreate={instance => (confirmConversion.current = instance)}
                            content={
                                <ConfirmationTooltip
                                    message={
                                        <p className="mb-2">
                                            The value you entered looks like {a(suggestionType?.name || '', { articleOnly: true })}{' '}
                                            <b>{suggestionType?.name}</b>. Do you want to convert it?
                                        </p>
                                    }
                                    closeTippy={() => confirmConversion.current.hide()}
                                    ref={confirmButtonRef}
                                    buttons={[
                                        {
                                            title: 'Convert',
                                            color: 'success',
                                            icon: faCheck,
                                            action: acceptSuggestion,
                                        },
                                        {
                                            title: 'Keep',
                                            color: 'secondary',
                                            icon: faTimes,
                                            action: rejectSuggestion,
                                        },
                                    ]}
                                />
                            }
                            interactive={true}
                            appendTo={document.body}
                            trigger="manual"
                            placement="top"
                        >
                            <span tabIndex="0">{editMode ? 'Done' : 'Create'}</span>
                        </Tippy>
                    )}
                </StyledButton>
            </InputGroup>
            {!isValid && <FormFeedback className="d-block">{formFeedback}</FormFeedback>}
        </div>
    );
};

ValueForm.propTypes = {
    id: PropTypes.string, // If the id is set (editMode)
    propertyId: PropTypes.string,
    resourceId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    setShowAddValue: PropTypes.func,
    showAddValue: PropTypes.bool,
};

export default ValueForm;
