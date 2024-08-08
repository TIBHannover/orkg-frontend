import Tippy from '@tippyjs/react';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import ListInputField from 'components/RosettaStone/SingleStatement/ListInputField';
import { getConfigByClassId, InputFormType } from 'constants/DataTypes';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { FC } from 'react';
import { Input, InputGroup } from 'reactstrap';
import { InputType } from 'reactstrap/types/lib/Input';
import { Node, PropertyShape } from 'services/backend/types';

type StatementInputFieldProps = {
    value: Node[];
    propertyShape: PropertyShape;
    updateValue: (value: Node[]) => void;
};

const StatementInputField: FC<StatementInputFieldProps> = ({ propertyShape, value, updateValue }) => {
    let range: Node | undefined;

    if ('class' in propertyShape && propertyShape.class) {
        range = propertyShape.class;
    } else if ('datatype' in propertyShape && propertyShape.datatype) {
        range = propertyShape.datatype;
    }

    let inputFormType: InputFormType;
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
        [key in InputFormType]?: JSX.Element;
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
                includeClasses={range?.id ? [range.id] : []}
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
                        type={inputFormType as InputType}
                        bsSize="sm"
                        value={value?.[0]?.label ?? ''}
                        onChange={(e) => updateValue([{ ...(value?.[0] ?? {}), label: e.target.value }])}
                        className="flex-grow-1"
                    />
                </InputGroup>
            </div>
        ),
    };

    return (
        <Tippy disabled={!propertyShape.description} content={propertyShape.description} trigger="focusin">
            <>
                {(!isMulti || inputFormType === 'autocomplete') && (Forms[inputFormType] || Forms.default)}
                {isMulti && inputFormType !== 'autocomplete' && (
                    <ListInputField value={value} updateValue={updateValue} inputFormType={inputFormType} />
                )}
            </>
        </Tippy>
    );
};

export default StatementInputField;
