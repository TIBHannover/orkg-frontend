import { components, MultiValueGenericProps } from 'react-select';
import { OptionType } from 'components/Autocomplete/types';
import Tippy from '@tippyjs/react';

const CustomMultiValueLabel = (props: MultiValueGenericProps<OptionType>) => {
    const { data } = props;
    const { innerProps, ...rest } = props;
    return (
        <Tippy content={data?.label}>
            {/* @ts-expect-error */}
            <span {...innerProps} style={innerProps.css}>
                <components.MultiValueLabel innerProps={{ className: undefined }} {...rest} />
            </span>
        </Tippy>
    );
};

export default CustomMultiValueLabel;
