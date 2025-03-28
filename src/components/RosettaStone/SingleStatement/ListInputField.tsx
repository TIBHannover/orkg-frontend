import { FC } from 'react';
import { components, InputProps } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { customClassNames, customStyles } from '@/components/Autocomplete/styled';
import { Node } from '@/services/backend/types';

type ListInputFieldProps = {
    value: Node[];
    inputFormType: string;
    placeholder?: string;
    updateValue: (value: Node[]) => void;
};

const ListInputField: FC<ListInputFieldProps> = ({ value, updateValue, inputFormType, placeholder }) => {
    // eslint-disable-next-line react/no-unstable-nested-components
    const Input = (props: InputProps<Node, true>) => {
        return <components.Input {...props} type={inputFormType} />;
    };

    return (
        <CreatableSelect
            isClearable
            isMulti
            classNamePrefix="react-select"
            size="sm"
            styles={customStyles}
            classNames={customClassNames}
            className="w-50 d-inline-block"
            onChange={(selected, metaAction) => {
                if (metaAction.action === 'clear') {
                    updateValue([]);
                } else if (metaAction.action === 'remove-value') {
                    updateValue((value.filter((v) => v.label !== metaAction.removedValue.label) as Node[]) ?? []);
                } else {
                    updateValue((selected as Node[]) ?? []);
                }
            }}
            placeholder={inputFormType === 'date' ? '' : placeholder ?? 'Add a value'}
            value={value}
            components={{
                Input,
            }}
        />
    );
};

export default ListInputField;
