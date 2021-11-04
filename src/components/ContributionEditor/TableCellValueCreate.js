import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { createLiteral, createResource } from 'slices/contributionEditorSlice';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { CLASSES, ENTITIES, PREDICATES, MISC } from 'constants/graphSettings';
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import InputField from 'components/StatementBrowser/InputField/InputField';
import PropTypes from 'prop-types';
import { memo, useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useClickAway } from 'react-use';
import Tippy from '@tippyjs/react';
import ConfirmationTooltip from 'components/StatementBrowser/ConfirmationTooltip/ConfirmationTooltip';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import a from 'indefinite';
import { InputGroup, FormFeedback } from 'reactstrap';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import styled from 'styled-components';

const CreateButtonContainer = styled.div`
    position: absolute;
    bottom: -13px;
    left: 50%;
    margin-left: -15px;
    z-index: 1;
    display: none;
`;

const TableCellValueCreate = ({ isVisible, contributionId, propertyId, isEmptyCell }) => {
    const [value, setValue] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [formFeedback, setFormFeedback] = useState(null);
    const [inputDataType, setInputDataType] = useState(
        getConfigByType(propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? ENTITIES.RESOURCE : MISC.DEFAULT_LITERAL_DATATYPE).type
    );
    const [entityType, setEntityType] = useState(
        getConfigByType(propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? ENTITIES.RESOURCE : MISC.DEFAULT_LITERAL_DATATYPE)._class
    );
    const [isValid, setIsValid] = useState(true);
    const refContainer = useRef(null);
    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const dispatch = useDispatch();

    const confirmButtonRef = useRef(null);

    const onShown = () => {
        confirmButtonRef.current.focus();
    };

    useClickAway(refContainer, () => {
        //setIsCreating(false);
        if (value === '') {
            setIsCreating(false);
        }
        createValue();
    });

    const createValue = () => {
        if (entityType === ENTITIES.LITERAL && value.trim()) {
            onSubmit();
        }
    };

    const getSchema = () => {
        const config = getConfigByType(inputDataType);
        return config.schema;
    };

    const acceptSuggestion = () => {
        confirmConversion.current.hide();
        dispatch(
            createLiteral({
                contributionId,
                propertyId,
                label: value,
                datatype: suggestionType.type
            })
        );
        setInputDataType(suggestionType.type);
        closeCreate();
    };

    const rejectSuggestion = () => {
        if (entityType === ENTITIES.RESOURCE) {
            dispatch(
                createResource({
                    contributionId,
                    propertyId,
                    resourceId: selectedObject.selected.id ?? null,
                    resourceLabel: value,
                    action: selectedObject.action,
                    classes: propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? [CLASSES.PROBLEM] : []
                })
            );
        } else {
            dispatch(
                createLiteral({
                    contributionId,
                    propertyId,
                    label: value,
                    datatype: getConfigByType(inputDataType).type
                })
            );
        }
        closeCreate();
    };

    const onSubmit = (selected = null, action = null) => {
        const { error } = getSchema().validate(value);
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            setFormFeedback(null);
            setIsValid(true);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(inputDataType, value);
            if (suggestions.length > 0 && propertyId !== PREDICATES.HAS_RESEARCH_PROBLEM) {
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else {
                if (entityType === ENTITIES.RESOURCE) {
                    dispatch(
                        createResource({
                            contributionId,
                            propertyId,
                            resourceId: selected.id ?? null,
                            resourceLabel: value,
                            action,
                            classes: propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? [CLASSES.PROBLEM] : []
                        })
                    );
                    closeCreate();
                } else {
                    dispatch(
                        createLiteral({
                            contributionId,
                            propertyId,
                            label: value,
                            datatype: getConfigByType(inputDataType).type
                        })
                    );
                    closeCreate();
                }
            }
        }
    };

    useEffect(() => {
        setFormFeedback(null);
        setIsValid(true);
        setEntityType(getConfigByType(inputDataType)._class);
        if (inputDataType === 'xsd:boolean') {
            setValue(v => Boolean(v).toString());
        }
    }, [inputDataType]);

    const handleChangeAutocomplete = async (selected, { action }) => {
        if (action !== 'create-option' && action !== 'select-option') {
            return;
        }
        setSelectedObject({ selected, action });
        onSubmit(selected, action);
    };

    const handleKeyPress = e => {
        if (e.key === 'Enter') {
            createValue();
        }
    };

    const closeCreate = () => {
        setSelectedObject(null);
        setIsCreating(false);
        setEntityType(getConfigByType(propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? ENTITIES.RESOURCE : MISC.DEFAULT_LITERAL_DATATYPE)._class);
        setInputDataType(getConfigByType(propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? ENTITIES.RESOURCE : MISC.DEFAULT_LITERAL_DATATYPE).type);
        setValue('');
    };

    return (
        <>
            {!isCreating && isVisible && (
                <div className={isEmptyCell ? 'h-100' : ''} role="button" tabIndex="0" onDoubleClick={() => setIsCreating(true)}>
                    <CreateButtonContainer className="create-button">
                        <StatementActionButton title="Add value" icon={faPlus} action={() => setIsCreating(true)} />
                    </CreateButtonContainer>
                </div>
            )}
            {isCreating && (
                <div ref={refContainer} style={{ height: 35 }}>
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
                                        action: acceptSuggestion
                                    },
                                    {
                                        title: 'Keep',
                                        color: 'secondary',
                                        icon: faTimes,
                                        action: rejectSuggestion
                                    }
                                ]}
                            />
                        }
                        interactive={true}
                        trigger="manual"
                        placement="top"
                    >
                        <span>
                            <InputGroup size="sm" style={{ width: 295 }}>
                                {entityType === ENTITIES.RESOURCE ? (
                                    <Autocomplete
                                        optionsClass={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? CLASSES.PROBLEM : undefined}
                                        entityType={ENTITIES.RESOURCE}
                                        excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.TEMPLATE}`}
                                        placeholder={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? 'Enter a research problem' : 'Enter a resource'}
                                        onChange={handleChangeAutocomplete}
                                        menuPortalTarget={document.body}
                                        onInput={(e, value) => setValue(e ? e.target.value : value)}
                                        value={value}
                                        openMenuOnFocus
                                        allowCreate
                                        allowCreateDuplicate={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? false : true}
                                        cssClasses="form-control-sm"
                                    />
                                ) : (
                                    <>
                                        <InputField
                                            inputValue={value}
                                            setInputValue={setValue}
                                            inputDataType={inputDataType}
                                            isValid={isValid}
                                            onKeyDown={handleKeyPress}
                                        />
                                        {!isValid && (
                                            <FormFeedback tooltip className="d-block">
                                                {formFeedback}
                                            </FormFeedback>
                                        )}
                                    </>
                                )}
                                {propertyId !== PREDICATES.HAS_RESEARCH_PROBLEM && (
                                    <DatatypeSelector
                                        disableBorderRadiusLeft={true}
                                        disableBorderRadiusRight={false}
                                        valueType={inputDataType}
                                        setValueType={setInputDataType}
                                    />
                                )}
                            </InputGroup>
                        </span>
                    </Tippy>
                </div>
            )}
        </>
    );
};

TableCellValueCreate.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    contributionId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    isEmptyCell: PropTypes.bool.isRequired
};

export default memo(TableCellValueCreate);
