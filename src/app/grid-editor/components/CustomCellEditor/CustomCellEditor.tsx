import { faCheck, faClose, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColDef, RowNode } from 'ag-grid-community';
import a from 'indefinite';
import React, { FC } from 'react';

import useSaveValue from '@/app/grid-editor/hooks/useSaveValue';
import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import ConfirmationTooltip from '@/components/FloatingUI/ConfirmationTooltip/ConfirmationTooltip';
import Popover from '@/components/FloatingUI/Popover';
import InputField from '@/components/InputField/InputField';
import SmartLiteralTypeCheck from '@/components/SmartSuggestions/SmartLiteralTypeCheck';
import SmartResourceLabelCheck from '@/components/SmartSuggestions/SmartResourceLabelCheck';
import Button from '@/components/Ui/Button/Button';
import FormFeedback from '@/components/Ui/Form/FormFeedback';
import InputGroup from '@/components/Ui/Input/InputGroup';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { getStatement } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

export const ROW_HEIGHT = 72;

// Define the interface for the reactive cell editor
type CustomCellEditorProps = {
    initialValue: Statement | null;
    value: Statement;
    onValueChange: (value: Statement | null) => void;
    stopEditing: () => void;
    colDef: ColDef;
    node: RowNode;
};

const CustomCellEditor: FC<CustomCellEditorProps> = ({ initialValue, value: statement, onValueChange, stopEditing, node, colDef }) => {
    const { mutateStatement } = useSwrStatementsCache();
    // Get the predicate from the row data
    const predicate = node.data?.predicate;
    // Get the subject entity from the column field (entity ID)
    const entityId = colDef?.field as string;
    const value = statement?.object;

    // Handle successful value submission
    const handleSuccess = async (statementId: string) => {
        try {
            // Fetch the updated statement
            const updatedStatement = await getStatement(statementId);
            mutateStatement(updatedStatement, statement || undefined);

            // Call onValueChange to update the grid
            onValueChange(updatedStatement);
        } catch (error) {
            console.error('Error fetching updated statement:', error);
        }
    };

    const {
        editMode,
        _class,
        range,
        placeholder,
        inputFormType,
        dataType,
        setDataType,
        inputValue,
        setInputValue,
        onSubmit,
        acceptSuggestion,
        rejectSuggestion,
        handleSubmitValue,
        suggestionType,
        setIsConversionTippyOpen,
        isConversionTippyOpen,
        isValid,
        formFeedback,
        setFormFeedback,
    } = useSaveValue(entityId, predicate, statement as Statement, handleSuccess, stopEditing);

    let optionsClasses: string[] = [];
    if (_class === ENTITIES.RESOURCE && range && range.id !== CLASSES.RESOURCE) {
        optionsClasses = [range.id];
    } else if (dataType === 'list') {
        optionsClasses = [CLASSES.LIST];
    }

    // Handle key events
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && inputFormType !== 'autocomplete') {
            onSubmit();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            // Revert to initial value and stop editing
            onValueChange(initialValue);
            stopEditing();
        }
    };

    return (
        <div
            className="custom-cell-editor tw:bg-white tw:w-[500px] tw:min-w-[500px] tw:h-full tw:flex tw:flex-col tw:p-1 tw:gap-1 tw:relative tw:z-[100]"
            style={{ minHeight: ROW_HEIGHT }}
            onKeyDown={handleKeyDown}
            role="textbox"
            tabIndex={0}
        >
            <div className="tw:flex tw:items-center tw:w-full">
                <InputGroup size="sm" className="tw:flex-grow-1 tw:flex-nowrap">
                    <DatatypeSelector
                        _class={editMode && value && '_class' in value ? value._class : undefined}
                        range={range && range.id !== CLASSES.RESOURCE ? range : undefined}
                        isDisabled={!!range}
                        dataType={dataType}
                        setDataType={setDataType}
                        menuPortalTarget={document.body}
                    />
                    <InputField
                        range={range && range.id !== CLASSES.RESOURCE ? range : undefined}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        inputFormType={inputFormType}
                        dataType={dataType}
                        isValid
                        placeholder={placeholder}
                        includeClasses={optionsClasses}
                        allowCreate
                        menuPortalTarget={document.body}
                        onChange={(selectedValue) => {
                            if (selectedValue) {
                                handleSubmitValue(_class, selectedValue, true);
                                stopEditing();
                            }
                        }}
                        onCreate={() => {
                            onSubmit();
                        }}
                    />
                    {_class === ENTITIES.RESOURCE && <SmartResourceLabelCheck label={inputValue} />}
                    {_class === ENTITIES.LITERAL && <SmartLiteralTypeCheck label={inputValue} />}
                    <Button
                        size="sm"
                        type="submit"
                        color="secondary"
                        className="tw:px-2"
                        onClick={() => {
                            setFormFeedback(null);
                            stopEditing();
                        }}
                        title="Cancel"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                    <Button
                        className="tw:px-2"
                        size="sm"
                        disabled={dataType !== 'empty' && !inputValue?.toString()}
                        type="submit"
                        color="primary"
                        onClick={onSubmit}
                        title="Save"
                    >
                        <Popover
                            modal
                            open={isConversionTippyOpen}
                            onOpenChange={setIsConversionTippyOpen}
                            content={
                                <ConfirmationTooltip
                                    message={
                                        <p className="tw:mb-2">
                                            The value you entered looks like {a(suggestionType?.name || '', { articleOnly: true })}{' '}
                                            <b>{suggestionType?.name}</b>. Do you want to convert it?
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
                        >
                            <span>{editMode ? <FontAwesomeIcon icon={faCheck} /> : 'Create'}</span>
                        </Popover>
                    </Button>
                </InputGroup>
            </div>
            {!isValid && <FormFeedback className="tw:block!">{formFeedback}</FormFeedback>}
        </div>
    );
};

CustomCellEditor.displayName = 'CustomCellEditor';

export default CustomCellEditor;
