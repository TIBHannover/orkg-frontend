import { customClassNames, customStyles } from 'components/Autocomplete/styled';
import { FC } from 'react';
import { InputProps, components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Node } from 'services/backend/types';

type ListInputFieldProps = {
    value: Node[];
    inputFormType: string;
    updateValue: (value: Node[]) => void;
};

const ListInputField: FC<ListInputFieldProps> = ({ value, updateValue, inputFormType }) => {
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
            placeholder={inputFormType === 'date' ? '' : 'Add a value'}
            value={value}
            components={{
                Input,
            }}
        />
    );
};

export default ListInputField;
