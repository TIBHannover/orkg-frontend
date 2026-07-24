import { faCheck, faClose, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover } from '@heroui/react';
import { ColDef, RowNode } from 'ag-grid-community';
import a from 'indefinite';
import React, { FC, useRef } from 'react';

import useSaveValue from '@/app/grid-editor/hooks/useSaveValue';
import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import ConfirmationTooltip from '@/components/FloatingUI/ConfirmationTooltip/ConfirmationTooltip';
import InputField from '@/components/InputField/InputField';
import SmartLiteralTypeCheck from '@/components/SmartSuggestions/SmartLiteralTypeCheck';
import SmartResourceLabelCheck from '@/components/SmartSuggestions/SmartResourceLabelCheck';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { getStatement } from '@/services/backend/statements';
import { Statement } from '@/services/backend/types';

export const ROW_HEIGHT = 72;

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
    const predicate = node.data?.predicate;
    const entityId = colDef?.field as string;
    const value = statement?.object;
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    const handleSuccess = async (statementId: string) => {
        try {
            const updatedStatement = await getStatement(statementId);
            mutateStatement(updatedStatement, statement || undefined);
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
    } else if (dataType === 'table') {
        optionsClasses = [CLASSES.CSVW_TABLE];
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && inputFormType !== 'autocomplete') {
            onSubmit();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            onValueChange(initialValue);
            stopEditing();
        }
    };

    const isSaveDisabled = dataType !== 'empty' && !inputValue?.toString();

    return (
        <div
            className="custom-cell-editor bg-white w-[500px] min-w-[500px] h-full flex flex-col p-1 gap-1 relative z-[100]"
            style={{ minHeight: ROW_HEIGHT }}
            onKeyDown={handleKeyDown}
            role="textbox"
            tabIndex={0}
        >
            <div className="flex items-stretch min-h-9 min-w-0">
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
                    groupPosition="middle"
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
                {_class === ENTITIES.RESOURCE && <SmartResourceLabelCheck label={inputValue} className="!h-9 !rounded-none -ms-px" />}
                {_class === ENTITIES.LITERAL && <SmartLiteralTypeCheck label={inputValue} className="!h-9 !rounded-none -ms-px" />}
                <Button
                    size="sm"
                    variant="secondary"
                    isIconOnly
                    className="!h-9 !rounded-none -ms-px"
                    onPress={() => {
                        setFormFeedback(null);
                        stopEditing();
                    }}
                    aria-label="Cancel"
                >
                    <FontAwesomeIcon icon={faClose} />
                </Button>
                <Popover>
                    <Button
                        ref={saveButtonRef}
                        size="sm"
                        variant="primary"
                        isDisabled={isSaveDisabled}
                        className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px px-2"
                        onPress={onSubmit}
                        aria-label="Save"
                    >
                        {editMode ? <FontAwesomeIcon icon={faCheck} /> : 'Create'}
                    </Button>
                    <Popover.Content triggerRef={saveButtonRef} isOpen={isConversionTippyOpen} onOpenChange={setIsConversionTippyOpen}>
                        <Popover.Dialog>
                            <Popover.Arrow />
                            <ConfirmationTooltip
                                onClose={() => setIsConversionTippyOpen(false)}
                                message={
                                    <p className="mb-2">
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
                        </Popover.Dialog>
                    </Popover.Content>
                </Popover>
            </div>
            {!isValid && <div className="text-sm text-danger mt-1">{formFeedback}</div>}
        </div>
    );
};

CustomCellEditor.displayName = 'CustomCellEditor';

export default CustomCellEditor;
