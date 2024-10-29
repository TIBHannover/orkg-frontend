import Autocomplete from 'components/Autocomplete/Autocomplete';
import { InputType, StandardInputType } from 'constants/DataTypes';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { Dispatch, FC, SetStateAction } from 'react';
import Textarea from 'react-textarea-autosize';
import { Input } from 'reactstrap';
import { Node } from 'services/backend/types';

type InputFieldProps = {
    value?: Node;
    range?: Node;
    setInputValue: Dispatch<SetStateAction<string>>;
    inputValue: string;
    dataType: string;
    isValid: boolean;
    placeholder?: string;
    inputFormType: InputType;
    excludeClasses?: string[];
    includeClasses?: string[];
    allowCreate?: boolean;
    onChange?: (value?: Node) => void;
};

const InputField: FC<InputFieldProps> = ({
    value,
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
}) => {
    const Forms: { [key: string]: JSX.Element } = {
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
                size="sm"
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
    };

    return Forms[inputFormType] || Forms.default;
};

export default InputField;
