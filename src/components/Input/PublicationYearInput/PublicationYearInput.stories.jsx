import { useState } from 'react';

import PublicationYearInput from '@/components/Input/PublicationYearInput/PublicationYearInput';

export default {
    title: 'Input/PublicationYearInput',
    component: PublicationYearInput,
    argTypes: {
        onChange: { action: 'onChange' },
        value: {
            control: {
                disable: true,
            },
        },
    },
};

const Template = (args) => {
    const [value, setValue] = useState(args.value ?? '');

    return (
        <PublicationYearInput
            {...args}
            onChange={(...params) => {
                args.onChange(...params);
                setValue(...params);
            }}
            value={value}
        />
    );
};

export const Default = Template.bind({});

Default.args = {
    value: '',
    inputId: '',
};
