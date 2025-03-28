import { FC, useState } from 'react';
import { Input, InputGroup } from 'reactstrap';

import AutoComplete from '@/components/Autocomplete/Autocomplete';
import DateTimeInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/DateTimeInput/DateTimeInput';
import DurationInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/DurationInput/DurationInput';
import GregorianInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/GregorianInput/GregorianInput';
import InputFieldModal from '@/components/DataBrowser/components/Body/ValueInputField/InputField/InputFieldModal';
import TimeInput from '@/components/DataBrowser/components/Body/ValueInputField/InputField/TimeInput/TimeInput';
import Tooltip from '@/components/FloatingUI/Tooltip';
import ListInputField from '@/components/RosettaStone/SingleStatement/ListInputField';
import { getConfigByClassId, InputType, StandardInputType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Node, RSPropertyShape } from '@/services/backend/types';

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
        [key in InputType]?: JSX.Element;
    } & {
        default: JSX.Element;
    } = {
        boolean: (
            <Input
                onChange={(e) => updateValue([{ ...(value?.[0] ?? {}), label: e.target.value }])}
                value={value?.[0]?.label ?? ''}
                type="select"
                name="literalValue"
                className="w-25 form-control-sm d-inline-block"
            >
                <option value="true">True</option>
                <option value="false">False</option>
            </Input>
        ),
        autocomplete: (
            <AutoComplete
                entityType={ENTITIES.RESOURCE}
                baseClass={range?.id ? range.id : ''}
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
                className="w-25 d-inline-block"
                enableExternalSources={!range?.id}
            />
        ),
        default: (
            <div className="w-25 d-inline-block">
                <InputGroup size="sm" className="d-flex">
                    <Input
                        placeholder={propertyShape.placeholder}
                        name="literalValue"
                        type={inputFormType as StandardInputType}
                        bsSize="sm"
                        value={value?.[0]?.label ?? ''}
                        onChange={(e) => updateValue([{ ...(value?.[0] ?? {}), label: e.target.value }])}
                        className="flex-grow-1"
                    />
                </InputGroup>
            </div>
        ),
        duration: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-25 d-inline-block"
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
                className="w-25 d-inline-block"
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
                className="w-25 d-inline-block"
            >
                <DurationInput
                    value={value?.[0]?.label ?? ''}
                    onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                    type="dayTimeDuration"
                />
            </InputFieldModal>
        ),
        gYearMonth: (
            <div className="w-25 d-inline-block">
                <div className="flex-grow-1 d-flex">
                    <GregorianInput
                        value={value?.[0]?.label ?? ''}
                        onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                        type="gYearMonth"
                    />
                </div>
            </div>
        ),
        gYear: (
            <div className="w-25 d-inline-block">
                <div className="flex-grow-1 d-flex">
                    <GregorianInput
                        value={value?.[0]?.label ?? ''}
                        onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                        type="gYear"
                    />
                </div>
            </div>
        ),
        gMonthDay: (
            <div className="w-25 d-inline-block">
                <div className="flex-grow-1 d-flex">
                    <GregorianInput
                        value={value?.[0]?.label ?? ''}
                        onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                        type="gMonthDay"
                    />
                </div>
            </div>
        ),
        gDay: (
            <div className="w-25 d-inline-block">
                <div className="flex-grow-1 d-flex">
                    <GregorianInput
                        value={value?.[0]?.label ?? ''}
                        onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                        type="gDay"
                    />
                </div>
            </div>
        ),
        gMonth: (
            <div className="w-25 d-inline-block">
                <div className="flex-grow-1 d-flex">
                    <GregorianInput
                        value={value?.[0]?.label ?? ''}
                        onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])}
                        type="gMonth"
                    />
                </div>
            </div>
        ),
        dateTime: (
            <InputFieldModal
                isOpen={isInputFieldModalOpen}
                setIsOpen={setIsInputFieldModalOpen}
                dataType={config.type}
                inputValue={value?.[0]?.label ?? ''}
                className="w-25 d-inline-block"
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
                className="w-25 d-inline-block"
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
                className="w-25 d-inline-block"
            >
                <TimeInput value={value?.[0]?.label ?? ''} onChange={(val) => updateValue([{ ...(value?.[0] ?? {}), label: val }])} />
            </InputFieldModal>
        ),
    };

    return (
        <Tooltip disabled={!propertyShape.description} content={propertyShape.description}>
            <span>
                {(!isMulti || inputFormType === 'autocomplete') && (Forms[inputFormType] || Forms.default)}
                {isMulti && inputFormType !== 'autocomplete' && (
                    <ListInputField value={value} updateValue={updateValue} inputFormType={inputFormType} placeholder={propertyShape.placeholder} />
                )}
            </span>
        </Tooltip>
    );
};

export default StatementInputField;
