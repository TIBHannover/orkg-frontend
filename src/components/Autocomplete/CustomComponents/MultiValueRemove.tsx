import type { GroupBase } from 'react-select';
import { components, MultiValueRemoveProps } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';

const MultiValueRemove = <OptionT extends OptionType, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
    props: MultiValueRemoveProps<OptionT, IsMulti, Group>,
) => {
    const { selectProps } = props;
    return (
        <components.MultiValueRemove
            {...props}
            innerProps={{ ...props.innerProps, className: selectProps.isDisabled ? 'd-none' : props.innerProps?.className }}
        />
    );
};

export default MultiValueRemove;
