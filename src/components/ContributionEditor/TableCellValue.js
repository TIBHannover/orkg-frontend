import { deleteStatement, updateLiteral, updateResource } from 'slices/contributionEditorSlice';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ItemInnerSeparator } from 'components/Comparison/TableCell';
import TableCellButtons from 'components/ContributionEditor/TableCellButtons';
import TableCellValueResource from 'components/ContributionEditor/TableCellValueResource';
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import InputField from 'components/StatementBrowser/InputField/InputField';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import a from 'indefinite';
import { CLASSES, ENTITIES, PREDICATES, MISC } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { forwardRef, memo, useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import env from '@beam-australia/react-env';
import Tippy from '@tippyjs/react';
import Joi from 'joi';
import ConfirmationTooltip from 'components/StatementBrowser/ConfirmationTooltip/ConfirmationTooltip';
import { InputGroup, FormFeedback } from 'reactstrap';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import styled from 'styled-components';
import { useClickAway } from 'react-use';

const Value = styled.div`
    &:hover .cell-buttons {
        display: block;
    }
`;

const TableCellValue = forwardRef(({ value, index, setDisableCreate, propertyId }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.label);
    const dispatch = useDispatch();
    const [formFeedback, setFormFeedback] = useState(null);
    const [isValid, setIsValid] = useState(true);
    const [draftLabel, setDraftLabel] = useState(value.label);
    const [draftDataType, setDraftDataType] = useState(
        value._class === ENTITIES.LITERAL ? value.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE
    );

    const refContainer = useRef(null);
    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);

    const confirmButtonRef = useRef(null);

    const onShown = () => {
        confirmButtonRef.current.focus();
    };

    useClickAway(refContainer, () => {
        if (value._class === ENTITIES.LITERAL && (draftDataType !== value.datatype || draftLabel !== value.label) && draftLabel !== '') {
            onSubmit();
        } else {
            handleStopEdit();
        }
    });

    const getSchema = () => {
        if (value._class === ENTITIES.LITERAL) {
            const config = getConfigByType(draftDataType);
            return config.schema;
        }
        return Joi.string();
    };

    const onSubmit = () => {
        const { error } = getSchema().validate(draftLabel);
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            // setDraftLabel(value);
            setFormFeedback(null);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(draftDataType, draftLabel);
            if (suggestions.length > 0 && value._class === ENTITIES.LITERAL) {
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else {
                // check if input is dirty
                if (draftDataType !== value.datatype || draftLabel !== value.label) {
                    dispatch(
                        updateLiteral({
                            id: value.id,
                            label: draftLabel,
                            datatype: value._class === ENTITIES.LITERAL ? getConfigByType(draftDataType).type : null
                        })
                    );
                }
                handleStopEdit();
            }
        }
    };

    const acceptSuggestion = () => {
        confirmConversion.current.hide();
        dispatch(
            updateLiteral({
                id: value.id,
                label: draftLabel,
                datatype: suggestionType.type
            })
        );
        setDraftDataType(suggestionType.type);
        handleStopEdit();
    };

    const rejectSuggestion = () => {
        dispatch(
            updateLiteral({
                id: value.id,
                label: draftLabel,
                datatype: getConfigByType(draftDataType).type
            })
        );
        handleStopEdit();
    };

    useEffect(() => {
        setFormFeedback(null);
        setIsValid(true);
        if (draftDataType === 'xsd:boolean') {
            setDraftLabel(v => Boolean(v).toString());
        }
    }, [draftDataType]);

    const handleStartEdit = () => {
        setIsEditing(true);
        setDisableCreate(true);
    };
    const handleStopEdit = () => {
        setIsEditing(false);
        setDisableCreate(false);
    };

    const handleDelete = () => {
        dispatch(deleteStatement(value.statementId));
    };

    const handleChangeAutocomplete = async (selected, { action }) => {
        handleStopEdit();
        if (action !== 'create-option' && action !== 'select-option') {
            return;
        }

        dispatch(
            updateResource({
                statementId: value.statementId,
                resourceId: selected.id ?? null,
                resourceLabel: inputValue,
                action
            })
        );
    };

    const handleKeyPress = e => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    };

    return (
        <div ref={ref}>
            <div ref={refContainer}>
                {!isEditing ? (
                    <>
                        {index > 0 && <ItemInnerSeparator className="my-0" />}
                        <Value className="position-relative">
                            {value._class === 'resource' && (
                                <ValuePlugins type={value._class} options={{ inModal: true }}>
                                    <TableCellValueResource value={value} />
                                </ValuePlugins>
                            )}
                            {value._class === 'literal' && (
                                <div
                                    role="textbox"
                                    tabIndex="0"
                                    onDoubleClick={env('PWC_USER_ID') !== value.created_by ? handleStartEdit : undefined}
                                >
                                    <ValuePlugins type={value._class} options={{ inModal: true }}>
                                        {value.label || <i>No label</i>}
                                    </ValuePlugins>
                                </div>
                            )}

                            {env('PWC_USER_ID') !== value.created_by && (
                                <TableCellButtons onEdit={handleStartEdit} onDelete={handleDelete} backgroundColor="rgba(240, 242, 247, 0.8)" />
                            )}
                        </Value>
                    </>
                ) : (
                    <div>
                        {value._class === 'resource' && (
                            <Autocomplete
                                optionsClass={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? CLASSES.PROBLEM : undefined}
                                entityType={ENTITIES.RESOURCE}
                                excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.TEMPLATE}`}
                                menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                                placeholder={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? 'Enter a research problem' : 'Enter a resource'}
                                onChange={handleChangeAutocomplete}
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                                onBlur={handleStopEdit}
                                openMenuOnFocus={true}
                                cssClasses="form-control-sm"
                                allowCreate
                            />
                        )}
                        {value._class === 'literal' && (
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
                                        <InputField
                                            inputValue={draftLabel}
                                            setInputValue={setDraftLabel}
                                            inputDataType={draftDataType}
                                            isValid={isValid}
                                            onKeyDown={handleKeyPress}
                                        />
                                        {!isValid && (
                                            <FormFeedback tooltip className="d-block">
                                                {formFeedback}
                                            </FormFeedback>
                                        )}
                                        <DatatypeSelector
                                            entity={ENTITIES.LITERAL}
                                            disableBorderRadiusLeft={true}
                                            disableBorderRadiusRight={false}
                                            valueType={draftDataType}
                                            setValueType={setDraftDataType}
                                        />
                                    </InputGroup>
                                </span>
                            </Tippy>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

TableCellValue.propTypes = {
    value: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    setDisableCreate: PropTypes.func.isRequired,
    propertyId: PropTypes.string.isRequired
};

export default memo(TableCellValue);
