import { cn, Input, ListBox, Select, TextField } from '@heroui/react';
import { FC, useState } from 'react';
import Textarea from 'react-textarea-autosize';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import DateTimeInput from '@/components/InputField/DateTimeInput/DateTimeInput';
import DurationInput from '@/components/InputField/DurationInput/DurationInput';
import GregorianInput from '@/components/InputField/GregorianInput/GregorianInput';
import InputFieldModal from '@/components/InputField/InputFieldModal';
import TimeInput from '@/components/InputField/TimeInput/TimeInput';
import { getConfigByType, InputType, StandardInputType } from '@/constants/DataTypes';
import { CLASSES } from '@/constants/graphSettings';
import { EntityType, Node } from '@/services/backend/types';

type InputFieldProps = {
    range?: Node;
    setInputValue: (value: string) => void;
    inputValue: string;
    dataType: string;
    isValid: boolean;
    placeholder?: string;
    inputFormType: InputType;
    excludeClasses?: string[];
    includeClasses?: string[];
    allowCreate?: boolean;
    onChange?: (value?: Node) => void;
    onFailure?: (e: Error) => void;
    menuPortalTarget?: HTMLElement | null;
    autoFocus?: boolean;
    onCreate?: (value?: Node) => void;
};

const InputField: FC<InputFieldProps> = ({
    range,
    setInputValue,
    inputValue,
    dataType,
    isValid,
    placeholder,
    inputFormType,
    includeClasses,
    onChange,
    allowCreate = false,
    onFailure,
    menuPortalTarget,
    autoFocus = true,
    onCreate,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const entityType = getConfigByType(dataType).type as EntityType;

    const Forms: { [key: string]: React.ReactNode } = {
        textarea: (
            <Textarea
                placeholder={placeholder ?? 'Enter a value'}
                name="literalValue"
                value={inputValue}
                onChange={(e) => setInputValue(e ? e.target.value : '')}
                className="flex-1 min-w-0 min-h-9 rounded-[var(--radius)] border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
                autoFocus={autoFocus}
                minRows={1}
            />
        ),
        boolean: (
            <Select
                aria-label="Boolean value"
                value={inputValue || 'false'}
                onChange={(key) => setInputValue(key ? String(key) : 'false')}
                className="flex-1 min-w-0 relative focus-within:z-10"
            >
                <Select.Trigger className="h-9 w-full">
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        <ListBox.Item id="true" textValue="True">
                            True
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="false" textValue="False">
                            False
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    </ListBox>
                </Select.Popover>
            </Select>
        ),
        duration: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={inputValue}>
                <DurationInput value={inputValue} onChange={setInputValue} />
            </InputFieldModal>
        ),
        yearMonthDuration: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={inputValue}>
                <DurationInput value={inputValue} onChange={setInputValue} type="yearMonthDuration" />
            </InputFieldModal>
        ),
        dayTimeDuration: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={inputValue}>
                <DurationInput value={inputValue} onChange={setInputValue} type="dayTimeDuration" />
            </InputFieldModal>
        ),
        gYearMonth: <GregorianInput value={inputValue} onChange={setInputValue} type="gYearMonth" />,
        gYear: <GregorianInput value={inputValue} onChange={setInputValue} type="gYear" />,
        gMonthDay: <GregorianInput value={inputValue} onChange={setInputValue} type="gMonthDay" />,
        gDay: <GregorianInput value={inputValue} onChange={setInputValue} type="gDay" />,
        gMonth: <GregorianInput value={inputValue} onChange={setInputValue} type="gMonth" />,
        autocomplete: (
            <div className="flex-1 min-w-0">
                <Autocomplete
                    key={entityType}
                    entityType={entityType}
                    excludeClasses={[
                        CLASSES.CONTRIBUTION,
                        CLASSES.NODE_SHAPE,
                        CLASSES.PROPERTY_SHAPE,
                        CLASSES.PAPER_DELETED,
                        CLASSES.CONTRIBUTION_DELETED,
                        CLASSES.EXTERNAL,
                        CLASSES.CSVW_CELL,
                        CLASSES.CSVW_ROW,
                        CLASSES.CSVW_COLUMN,
                    ]}
                    includeClasses={includeClasses}
                    placeholder={placeholder ?? `Enter a ${dataType}`}
                    isMulti={false}
                    onChange={(i, { action }) => {
                        if (action === 'select-option') {
                            onChange?.(i as Node);
                        }
                        if (action === 'create-option') {
                            onCreate?.(i as Node);
                        }
                    }}
                    allowCreate={allowCreate}
                    enableExternalSources={!range?.id}
                    onInputChange={(newValue, actionMeta) => {
                        if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                            setInputValue(newValue);
                        }
                    }}
                    inputValue={inputValue}
                    openMenuOnFocus
                    autoFocus={autoFocus}
                    size="sm"
                    onFailure={onFailure}
                    menuPortalTarget={menuPortalTarget}
                />
            </div>
        ),
        empty: (
            <TextField fullWidth value="Value not reported in paper" isDisabled className="flex-1 min-w-0 relative">
                <Input type="text" />
            </TextField>
        ),
        default: (
            <TextField
                fullWidth
                value={inputValue}
                onChange={setInputValue}
                isInvalid={!isValid}
                className="flex-1 min-w-0 relative focus-within:z-10"
            >
                <Input
                    placeholder={placeholder ?? 'Enter a value'}
                    name="literalValue"
                    type={inputFormType as StandardInputType}
                    autoFocus={autoFocus}
                    className={cn(!isValid && 'border-danger')}
                />
            </TextField>
        ),
        dateTime: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={inputValue}>
                <DateTimeInput value={inputValue} onChange={setInputValue} type="dateTime" />
            </InputFieldModal>
        ),
        dateTimeStamp: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={inputValue}>
                <DateTimeInput value={inputValue} onChange={setInputValue} type="dateTimeStamp" />
            </InputFieldModal>
        ),
        time: (
            <InputFieldModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} dataType={dataType} inputValue={inputValue}>
                <TimeInput value={inputValue} onChange={setInputValue} />
            </InputFieldModal>
        ),
    };

    return Forms[inputFormType] || Forms.default;
};

export default InputField;
