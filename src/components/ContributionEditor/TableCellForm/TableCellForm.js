import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import DatatypeSelector from 'components/ContributionEditor/DatatypeSelector/DatatypeSelector';
import InputField from 'components/ContributionEditor/InputField/InputField';
import useTableCellForm from 'components/ContributionEditor/TableCellForm/hooks/useTableCellForm';
import ConfirmationTooltip from 'components/FloatingUI/ConfirmationTooltip/ConfirmationTooltip';
import Popover from 'components/FloatingUI/Popover';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import a from 'indefinite';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useClickAway } from 'react-use';
import { FormFeedback, InputGroup } from 'reactstrap';
import { addValue, setPreviousInputDataType } from 'slices/contributionEditorSlice';
import { compareOption } from 'utils';

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

    const [isValid, setIsValid] = useState(true);
    const [isConversionTippyOpen, setIsConversionTippyOpen] = useState(false);

    // we need this state to prevent closing the modal of selecting ontologies when the users clicks outside the input field because of useClickAway
    const [ontologyModalIsOpen, setOntologyModalIsOpen] = useState(false);
    const [inputFieldModalIsOpen, setInputFieldModalIsOpen] = useState(false);
    const [formFeedback, setFormFeedback] = useState(null);

    const [suggestionType, setSuggestionType] = useState(null);

    useClickAway(refContainer, () => {
        // setIsCreating(false);
        if (!ontologyModalIsOpen && !inputFieldModalIsOpen) {
            if (!editMode) {
                if ((inputValue === '' && inputFormType !== 'empty') || entityType === ENTITIES.RESOURCE) {
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
        if ((entityType === ENTITIES.LITERAL && inputValue.trim()) || inputFormType === 'empty') {
            onSubmit();
        }
    };

    const onSubmit = () => {
        let error;
        if (schema) {
            error = schema.safeParse(inputValue.trim()).error;
        }
        if (error) {
            setFormFeedback(error.errors?.[0]?.message);
            setIsValid(false);
        } else {
            setFormFeedback(null);
            setIsValid(true);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(inputDataType, inputValue.trim());
            if (suggestions.length > 0 && !valueClass) {
                setSuggestionType(suggestions[0]);
                setIsConversionTippyOpen(true);
            } else if (!editMode) {
                dispatch(addValue(entityType, { label: inputValue.trim(), datatype: getDataType() }, valueClass, contributionId, propertyId));
                closeForm?.(false);
            } else {
                commitChangeLabel(inputValue.trim(), getDataType(inputDataType));
                closeForm();
            }
        }
    };

    const acceptSuggestion = () => {
        if (!editMode) {
            dispatch(
                addValue(suggestionType._class, { label: inputValue.trim(), datatype: suggestionType.type }, valueClass, contributionId, propertyId),
            );
            setInputDataType(suggestionType.type);
            closeForm?.(false);
        } else {
            setIsConversionTippyOpen(false);
            commitChangeLabel(inputValue.trim(), suggestionType.type);
            setInputDataType(suggestionType.type);
            closeForm();
        }
    };

    const rejectSuggestion = () => {
        if (!editMode) {
            dispatch(addValue(entityType, { label: inputValue.trim(), datatype: getDataType() }, valueClass, contributionId, propertyId));
            closeForm?.(false);
        } else {
            commitChangeLabel(inputValue.trim(), getDataType(inputDataType));
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
            setInputValue((v) => Boolean(v === 'true').toString());
        }
    }, [inputDataType, setEntityType, setInputValue, setInputFormType]);

    const handleSetValueType = (type) => {
        dispatch(setPreviousInputDataType(type));
        setInputDataType(type);
    };

    return (
        <div ref={refContainer} style={{ minHeight: 35 }}>
            <Popover
                modal
                open={isConversionTippyOpen}
                onOpenChange={setIsConversionTippyOpen}
                content={
                    <ConfirmationTooltip
                        message={
                            <p className="mb-2">
                                The value you entered looks like {a(suggestionType?.name || '', { articleOnly: true })} <b>{suggestionType?.name}</b>.
                                Do you want to convert it?
                            </p>
                        }
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
                placement="top"
            >
                <span>
                    <InputGroup size="sm" style={{ minWidth: 295, zIndex: 100 }}>
                        {!editMode && inputFormType === 'autocomplete' ? (
                            <Autocomplete
                                entityType={entityType}
                                excludeClasses={
                                    entityType === ENTITIES.RESOURCE && !valueClass
                                        ? [
                                              CLASSES.CONTRIBUTION,
                                              CLASSES.PROBLEM,
                                              CLASSES.NODE_SHAPE,
                                              CLASSES.PROPERTY_SHAPE,
                                              CLASSES.PAPER_DELETED,
                                              CLASSES.CONTRIBUTION_DELETED,
                                              CLASSES.EXTERNAL,
                                          ]
                                        : []
                                }
                                includeClasses={entityType === ENTITIES.RESOURCE && valueClass ? [valueClass.id] : []}
                                placeholder={propertyShape?.placeholder ? propertyShape.placeholder : `Enter a ${entityType}`}
                                onChange={(i, { action }) => {
                                    if (action === 'select-option') {
                                        dispatch(addValue(entityType, { ...i, selected: true }, valueClass, contributionId, propertyId));
                                        closeForm?.(false);
                                    } else if (action === 'create-option' && i) {
                                        dispatch(
                                            addValue(
                                                entityType,
                                                { label: i.label, selected: false, datatype: getDataType() },
                                                valueClass,
                                                contributionId,
                                                propertyId,
                                            ),
                                        );
                                        closeForm?.(false);
                                    }
                                }}
                                isClearable={false}
                                enableExternalSources={!valueClass}
                                onInputChange={(newValue, actionMeta) => {
                                    if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                        setInputValue(newValue);
                                    }
                                }}
                                menuPortalTarget={document?.body}
                                inputValue={inputValue}
                                openMenuOnFocus
                                allowCreate
                                isValidNewOption={(val, selectValue, selectOptions) => {
                                    if (val && !isUniqLabel) {
                                        return true;
                                    }
                                    return !(
                                        !val ||
                                        selectValue.some((option) => compareOption(val, option)) ||
                                        selectOptions.some((option) => compareOption(val, option))
                                    );
                                }}
                                onKeyDown={(e) => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        closeForm?.(false);
                                    }
                                }}
                                size="sm"
                                onOntologySelectorModalStatusChange={(status) => setOntologyModalIsOpen(status)}
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
                                    onKeyDown={(e) => {
                                        if (e.keyCode === 27) {
                                            // escape
                                            closeForm?.(false);
                                        } else if (e.keyCode === 13) {
                                            onSubmit();
                                        }
                                    }}
                                    placeholder={propertyShape?.placeholder}
                                    inputFieldModalIsOpen={inputFieldModalIsOpen}
                                    setInputFieldModalIsOpen={setInputFieldModalIsOpen}
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
                            disableBorderRadiusLeft
                            disableBorderRadiusRight={false}
                            valueType={inputDataType}
                            setValueType={handleSetValueType}
                            menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                            syncBackend
                        />
                    </InputGroup>
                </span>
            </Popover>
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
