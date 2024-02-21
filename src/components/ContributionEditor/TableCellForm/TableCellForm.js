import { useState, useRef, useEffect } from 'react';
import { InputGroup, FormFeedback } from 'reactstrap';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import InputField from 'components/StatementBrowser/InputField/InputField';
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import a from 'indefinite';
import { useDispatch } from 'react-redux';
import { addValue, setPreviousInputDataType } from 'slices/contributionEditorSlice';
import { useClickAway } from 'react-use';
import ConfirmationTooltip from 'components/StatementBrowser/ConfirmationTooltip/ConfirmationTooltip';
import Tippy from '@tippyjs/react';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import useTableCellForm from 'components/ContributionEditor/TableCellForm/hooks/useTableCellForm';

const TableCellForm = ({ value, contributionId, propertyId, closeForm }) => {
    const refContainer = useRef(null);
    const editMode = Boolean(value);

    const {
        propertyShape,
        schema,
        isUniqLabel,
        valueClass,
        inputDataType,
        inputValue,
        entityType,
        getDataType,
        setInputDataType,
        setEntityType,
        setInputValue,
        commitChangeLabel,
        inputFormType,
        setInputFormType,
    } = useTableCellForm({ value, contributionId, propertyId });

    const dispatch = useDispatch();

    const literalInputRef = useRef(null);
    const autocompleteInputRef = useRef(null);
    const confirmButtonRef = useRef(null);

    const onShown = () => {
        confirmButtonRef.current.focus();
    };

    const [isValid, setIsValid] = useState(true);

    // we need this state to prevent closing the modal of selecting ontologies when the users clicks outside the input field because of useClickAway
    const [ontologyModalIsOpen, setOntologyModalIsOpen] = useState(false);
    const [formFeedback, setFormFeedback] = useState(null);
    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);

    useClickAway(refContainer, () => {
        // setIsCreating(false);
        if (!ontologyModalIsOpen) {
            if (!editMode) {
                if (inputValue === '' && inputFormType !== 'empty') {
                    closeForm(false);
                }
                createValue();
            } else if ((inputDataType !== value.datatype || inputValue !== value.label) && inputValue !== '') {
                onSubmit();
            } else {
                closeForm();
            }
        }
    });

    const createValue = () => {
        if ((entityType === ENTITIES.LITERAL && inputValue.trim()) || entityType === ENTITIES.RESOURCE || inputFormType === 'empty') {
            onSubmit();
        }
    };

    const onSubmit = () => {
        let error;
        if (schema) {
            error = schema.validate(inputValue).error;
        }
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            setFormFeedback(null);
            setIsValid(true);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(inputDataType, inputValue);
            if (suggestions.length > 0 && !valueClass) {
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else if (!editMode) {
                dispatch(addValue(entityType, { label: inputValue, datatype: getDataType() }, valueClass, contributionId, propertyId));
                closeForm?.(false);
            } else {
                commitChangeLabel(inputValue, getDataType(inputDataType));
                closeForm();
            }
        }
    };

    const acceptSuggestion = () => {
        if (!editMode) {
            dispatch(addValue(suggestionType._class, { label: inputValue, datatype: suggestionType.type }, valueClass, contributionId, propertyId));
            setInputDataType(suggestionType.type);
            closeForm?.(false);
        } else {
            confirmConversion.current.hide();
            commitChangeLabel(inputValue, suggestionType.type);
            setInputDataType(suggestionType.type);
            closeForm();
        }
    };

    const rejectSuggestion = () => {
        if (!editMode) {
            dispatch(addValue(entityType, { label: inputValue, datatype: getDataType() }, valueClass, contributionId, propertyId));
            closeForm?.(false);
        } else {
            commitChangeLabel(inputValue, getDataType(inputDataType));
            closeForm();
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
        setInputFormType(getConfigByType(inputDataType).inputFormType);
        if (inputDataType === 'xsd:boolean') {
            setInputValue(v => Boolean(v === 'true').toString());
        }
    }, [inputDataType, setEntityType, setInputValue, setInputFormType]);

    const handleSetValueType = type => {
        dispatch(setPreviousInputDataType(type));
        setInputDataType(type);
    };

    return (
        <div ref={refContainer} style={{ minHeight: 35 }}>
            <Tippy
                onShown={onShown}
                onCreate={instance => (confirmConversion.current = instance)}
                content={
                    <ConfirmationTooltip
                        message={
                            <p className="mb-2">
                                The value you entered looks like {a(suggestionType?.name || '', { articleOnly: true })} <b>{suggestionType?.name}</b>.
                                Do you want to convert it?
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
                appendTo={document.body}
                interactive={true}
                trigger="manual"
                placement="top"
            >
                <span>
                    <InputGroup size="sm" style={{ minWidth: 295, zIndex: 100 }}>
                        {!editMode && inputFormType === 'autocomplete' ? (
                            <AutoComplete
                                entityType={entityType}
                                excludeClasses={
                                    entityType === ENTITIES.RESOURCE && !valueClass
                                        ? `${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.NODE_SHAPE},${CLASSES.PROPERTY_SHAPE},${CLASSES.PAPER_DELETED},${CLASSES.CONTRIBUTION_DELETED},${CLASSES.EXTERNAL}`
                                        : null
                                }
                                optionsClass={entityType === ENTITIES.RESOURCE && valueClass ? valueClass.id : undefined}
                                placeholder={propertyShape?.placeholder ? propertyShape.placeholder : `Enter a ${entityType}`}
                                onItemSelected={i => {
                                    dispatch(addValue(entityType, { ...i, label: i.value, selected: true }, valueClass, contributionId, propertyId));
                                    closeForm?.(false);
                                }}
                                onNewItemSelected={label => {
                                    dispatch(
                                        addValue(
                                            entityType,
                                            { label, selected: false, datatype: getDataType() },
                                            valueClass,
                                            contributionId,
                                            propertyId,
                                        ),
                                    );
                                    closeForm?.(false);
                                }}
                                ols={!valueClass}
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                menuPortalTarget={document.body}
                                value={inputValue}
                                autoLoadOption={!!valueClass}
                                openMenuOnFocus={true}
                                allowCreate
                                allowCreateDuplicate={!isUniqLabel}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        closeForm?.(false);
                                    }
                                }}
                                innerRef={ref => (autocompleteInputRef.current = ref)}
                                cssClasses="form-control-sm"
                                onOntologySelectorIsOpenStatusChange={status => setOntologyModalIsOpen(status)}
                            />
                        ) : (
                            <>
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
                                            closeForm?.(false);
                                        } else if (e.keyCode === 13) {
                                            onSubmit();
                                        }
                                    }}
                                    placeholder={propertyShape?.placeholder}
                                />
                                {!isValid && (
                                    <FormFeedback tooltip className="d-block">
                                        {formFeedback}
                                    </FormFeedback>
                                )}
                            </>
                        )}
                        <DatatypeSelector
                            valueClass={valueClass}
                            isDisabled={!((!editMode && !valueClass) || (editMode && !valueClass && value._class === ENTITIES.LITERAL))}
                            entity={editMode ? value._class : null}
                            disableBorderRadiusLeft={true}
                            disableBorderRadiusRight={false}
                            valueType={inputDataType}
                            setValueType={handleSetValueType}
                            menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                            syncBackend={true}
                        />
                    </InputGroup>
                </span>
            </Tippy>
        </div>
    );
};

TableCellForm.propTypes = {
    value: PropTypes.object, // If the id is set (editMode)
    contributionId: PropTypes.string,
    propertyId: PropTypes.string,
    closeForm: PropTypes.func,
};

export default TableCellForm;
