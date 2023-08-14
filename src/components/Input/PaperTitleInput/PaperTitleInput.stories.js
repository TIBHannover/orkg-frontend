import PaperTitleInput from 'components/Input/PaperTitleInput/PaperTitleInput';
import { useState } from 'react';

export default {
    title: 'Input/PaperTitleInput',
    component: PaperTitleInput,
    argTypes: {
        onChange: { action: 'onChange' },
        onOptionClick: { action: 'onOptionClick' },
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
        <PaperTitleInput
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
    performExistingPaperLookup: true,
    performOrkgLookup: false,
    placeholder: 'Search for a paper by title',
    contentType: 'all',
    borderRadius: 6,
    inputId: '',
};
