import type { GroupBase } from 'react-select';
import { components, InputProps } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

const Input = <OptionT extends OptionType, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
    props: InputProps<OptionT, IsMulti, Group>,
) => <components.Input {...props} maxLength={MAX_LENGTH_INPUT} />;

export default Input;
