import { Input, Tooltip } from '@heroui/react';
import { FC, useState } from 'react';

import AutoComplete from '@/components/Autocomplete/Autocomplete';
import DateTimeInput from '@/components/InputField/DateTimeInput/DateTimeInput';
import DurationInput from '@/components/InputField/DurationInput/DurationInput';
import GregorianInput from '@/components/InputField/GregorianInput/GregorianInput';
import InputFieldModal from '@/components/InputField/InputFieldModal';
import TimeInput from '@/components/InputField/TimeInput/TimeInput';
import ListInputField from '@/components/RosettaStone/SingleStatement/ListInputField';
import { getConfigByClassId, InputType, StandardInputType } from '@/constants/DataTypes';
import { CLASSES } from '@/constants/graphSettings';
import { EntityType, Node, RSPropertyShape } from '@/services/backend/types';

type StatementInputFieldProps = {
    value: Node[];
    propertyShape: RSPropertyShape;
    updateValue: (value: Node[]) => void;
};

const StatementInputField: FC<StatementInputFieldProps> = ({ propertyShape, value, updateValue }) => {
    const [isInputFieldModalOpen, setIsInputFieldModalOpen] = useState(false);
    let range: Node | undefined;

    if ('class' in propertyShape && propertyShape.class) {
        range = propertyShape.class;
    } else if ('datatype' in propertyShape && propertyShape.datatype) {
        range = propertyShape.datatype;
    }

    let inputFormType: InputType;
    const config = getConfigByClassId(range?.id ?? '');
    inputFormType = config.inputFormType;

    // Convert textarea to simple text field
    if (CLASSES.STRING === range?.id) {
        inputFormType = 'text';
    }

    let isMulti = false;
    if (!propertyShape.max_count || parseInt(propertyShape.max_count.toString(), 10) > 1) {
        isMulti = true;
    }

    const Forms: {
        [key in InputType]?: React.ReactNode;
    } & {
        default: React.ReactNode;
    } = {
        boolean: (
            <span className="w-1/4 inline-block align-middle leading-normal">
                <select
                    onChange={(e) => updateValue([{ ...(value?.[0] ?? {}), label: e.target.value }])}
                    value={value?.[0]?.label ?? ''}
                    name="literalValue"
                    className="input input--full-width py-1 px-2 text-sm w-full"
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </span>
        ),
        autocomplete: (
            <span className="w-1/4 inline-block align-middle leading-normal">
                <AutoComplete
                    entityType={config._class as EntityType}
                    baseClass={range?.id && range.id !== CLASSES.RESOURCE ? range.id : ''}
                    excludeClasses={[CLASSES.ROSETTA_STONE_STATEMENT]}
                    placeholder={propertyShape.placeholder}
                    onChange={(selected, { action }) => {
                        if (action === 'clear') {
                            updateValue([]);
                        } else if (isMulti) {
                            updateValue((selected as Node[]) ?? []);
                        } else {
                            updateValue(selected ? [selected as Node] : []);
                        }
                    }}
                    value={value}
                    openMenuOnFocus
                    isClearable
                    allowCreate
                    isMulti={isMulti}
                    size="sm"
                    enableExternalSources={!(range?.id && range.id !== CLASSES.RESOURCE)}
                />
            </span>
        ),
        default: (
            <span className="w-1/4 inline-block align-middle leading-normal">
                <Input
                    fullWidth
                    placeholder={propertyShape.placeholder}
                    name="literalValue"
                    type={inputFormType as StandardInputType}
                    value={value?.[0]?.label ?? ''}
                    onChange={(e) => updateValue([{ ...(value?.[0] ?? {}), label: e.target.value }])}
                    className="py-1 px-2 text-sm"
                />
            </span>
        ),
        duration: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-1/4 inline-block align-middle leading-normal"
            >
                <DurationInput value={value?.[0]?.label ?? ''} onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])} />
            </InputFieldModal>
        ),
        yearMonthDuration: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-1/4 inline-block align-middle leading-normal"
            >
                <DurationInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="yearMonthDuration"
                />
            </InputFieldModal>
        ),
        dayTimeDuration: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-1/4 inline-block align-middle leading-normal"
            >
                <DurationInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="dayTimeDuration"
                />
            </InputFieldModal>
        ),
        gYearMonth: (
            <div className="w-1/4 inline-block align-middle leading-normal">
                <GregorianInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="gYearMonth"
                />
            </div>
        ),
        gYear: (
            <div className="w-1/4 inline-block align-middle leading-normal">
                <GregorianInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="gYear"
                />
            </div>
        ),
        gMonthDay: (
            <div className="w-1/4 inline-block align-middle leading-normal">
                <GregorianInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="gMonthDay"
                />
            </div>
        ),
        gDay: (
            <div className="w-1/4 inline-block align-middle leading-normal">
                <GregorianInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="gDay"
                />
            </div>
        ),
        gMonth: (
            <div className="w-1/4 inline-block align-middle leading-normal">
                <GregorianInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="gMonth"
                />
            </div>
        ),
        dateTime: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-1/4 inline-block align-middle leading-normal"
            >
                <DateTimeInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="dateTime"
                />
            </InputFieldModal>
        ),
        dateTimeStamp: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-1/4 inline-block align-middle leading-normal"
            >
                <DateTimeInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="dateTimeStamp"
                />
            </InputFieldModal>
        ),
        time: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-1/4 inline-block align-middle leading-normal"
            >
                <TimeInput value={value?.[0]?.label ?? ''} onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])} />
            </InputFieldModal>
        ),
    };

    const field =
        !isMulti || inputFormType === 'autocomplete' ? (
            (Forms[inputFormType] ?? Forms.default)
        ) : (
            <ListInputField value={value} updateValue={updateValue} inputFormType={inputFormType} placeholder={propertyShape.placeholder} />
        );

    if (!propertyShape.description) {
        return field as React.ReactElement;
    }

    return (
        <Tooltip>
            {field}
            <Tooltip.Content>{propertyShape.description}</Tooltip.Content>
        </Tooltip>
    );
};

export default StatementInputField;
