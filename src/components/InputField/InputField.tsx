import { FC, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { Input } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import DateTimeInput from '@/components/InputField/DateTimeInput/DateTimeInput';
import DurationInput from '@/components/InputField/DurationInput/DurationInput';
import GregorianInput from '@/components/InputField/GregorianInput/GregorianInput';
import InputFieldModal from '@/components/InputField/InputFieldModal';
import TimeInput from '@/components/InputField/TimeInput/TimeInput';
import { InputType, StandardInputType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Node } from '@/services/backend/types';

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
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const Forms: { [key: string]: React.ReactNode } = {
        textarea: (
            <Textarea
                placeholder={placeholder ?? 'Enter a value'}
                name="literalValue"
                value={inputValue}
                onChange={(e) => setInputValue(e ? e.target.value : '')}
                className="form-control form-control-sm flex-grow d-flex"
                autoFocus
                minRows={1}
            />
        ),
        boolean: (
            <Input
                onChange={(e) => setInputValue(e ? e.target.value : 'false')}
                value={inputValue}
                type="select"
                name="literalValue"
                bsSize="sm"
                className="flex-grow-1 d-flex"
            >
                <option value="true">True</option>
                <option value="false">False</option>
            </Input>
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
            <Autocomplete
                entityType={ENTITIES.RESOURCE}
                excludeClasses={[
                    CLASSES.CONTRIBUTION,
                    CLASSES.NODE_SHAPE,
                    CLASSES.PROPERTY_SHAPE,
                    CLASSES.PAPER_DELETED,
                    CLASSES.CONTRIBUTION_DELETED,
                    CLASSES.EXTERNAL,
                ]}
                includeClasses={includeClasses}
                placeholder={placeholder ?? `Enter a ${dataType}`}
                isMulti={false}
                onChange={(i, { action }) => {
                    if (action === 'select-option') {
                        onChange?.(i as Node);
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
                autoFocus
                size="sm"
                onFailure={onFailure}
            />
        ),
        empty: <Input value="Value not reported in paper" type="text" bsSize="sm" className="flex-grow-1 d-flex" disabled />,
        default: (
            <Input
                placeholder={placeholder ?? 'Enter a value'}
                name="literalValue"
                type={inputFormType as StandardInputType}
                bsSize="sm"
                value={inputValue}
                onChange={(e) => setInputValue(e ? e.target.value : '')}
                invalid={!isValid}
                className="flex-grow d-flex"
                autoFocus
            />
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
