import { components, MultiValueGenericProps } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import Tooltip from '@/components/FloatingUI/Tooltip';

const CustomMultiValueLabel = (props: MultiValueGenericProps<OptionType>) => {
    const { data, selectProps } = props;
    const { innerProps, ...rest } = props;
    return (
        <Tooltip content={data ? selectProps.getOptionLabel(data) : undefined}>
            {/* @ts-expect-error */}
            <span {...innerProps} style={innerProps.css}>
                <components.MultiValueLabel innerProps={{ className: undefined }} {...rest} />
            </span>
        </Tooltip>
    );
};

export default CustomMultiValueLabel;
