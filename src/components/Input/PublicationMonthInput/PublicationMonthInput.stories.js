import PublicationMonthInput from 'components/Input/PublicationMonthInput/PublicationMonthInput';
import { useState } from 'react';

export default {
    title: 'Input/PublicationMonthInput',
    component: PublicationMonthInput,
    argTypes: {
        onChange: { action: 'onChange' },
        value: {
            control: {
                disable: true,
            },
        },
    },
};

const Template = args => {
    const [value, setValue] = useState(args.value ?? '');

    return (
        <PublicationMonthInput
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
