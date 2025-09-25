import type { GroupBase } from 'react-select';
import { components, InputProps } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

const Input = <OptionT extends OptionType, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
    props: InputProps<OptionT, IsMulti, Group>,
) => {
    const newProps = {
        ...props,
        // https://github.com/JedWatson/react-select/issues/5459#issuecomment-3010993879
        'aria-activedescendant': undefined,
    };
    return <components.Input {...newProps} maxLength={MAX_LENGTH_INPUT} />;
};

export default Input;
