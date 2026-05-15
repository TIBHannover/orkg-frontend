import { faCheck, faClose, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover } from '@heroui/react';
import a from 'indefinite';
import { FC, useRef } from 'react';

import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import useSaveValue from '@/components/DataBrowser/hooks/useSaveValue';
import ConfirmationTooltip from '@/components/FloatingUI/ConfirmationTooltip/ConfirmationTooltip';
import InputField from '@/components/InputField/InputField';
import SmartLiteralTypeCheck from '@/components/SmartSuggestions/SmartLiteralTypeCheck';
import SmartResourceLabelCheck from '@/components/SmartSuggestions/SmartResourceLabelCheck';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Literal, Node, Predicate } from '@/services/backend/types';

type ValueInputFieldProps = {
    predicate: Predicate;
    value?: Node | Literal;
    allowCreate?: boolean;
    toggleShowInput: () => void;
};

const ValueInputField: FC<ValueInputFieldProps> = ({ predicate, value, allowCreate = false, toggleShowInput }) => {
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
    } = useSaveValue(predicate, toggleShowInput, value);

    let optionsClasses: string[] = [];
    if (_class === ENTITIES.RESOURCE && range && range.id !== CLASSES.RESOURCE) {
        optionsClasses = [range.id];
    } else if (dataType === 'list') {
        optionsClasses = [CLASSES.LIST];
    } else if (dataType === 'table') {
        optionsClasses = [CLASSES.CSVW_TABLE];
    }

    const isSaveDisabled = dataType !== 'empty' && !inputValue?.toString();
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <div className="flex flex-col grow min-w-0">
            <div className="flex items-stretch min-h-9 grow min-w-0">
                <DatatypeSelector
                    _class={editMode && value && '_class' in value ? value._class : undefined}
                    range={range && range.id !== CLASSES.RESOURCE ? range : undefined}
                    isDisabled={!!range}
                    dataType={dataType}
                    setDataType={setDataType}
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
                    allowCreate={allowCreate}
                    onChange={(selectedValue) => {
                        if (selectedValue) {
                            handleSubmitValue(_class, selectedValue, true);
                            toggleShowInput();
                        }
                    }}
                    onFailure={() => {
                        toggleShowInput();
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
                        toggleShowInput();
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

export default ValueInputField;
