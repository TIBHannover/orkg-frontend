import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import PaperTitleInput from '@/components/Input/PaperTitleInput/PaperTitleInput';

const meta: Meta<typeof PaperTitleInput> = {
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

export default meta;
type Story = StoryObj<typeof PaperTitleInput>;

export const Default: Story = {
    args: {
        value: '',
        performExistingPaperLookup: true,
        performOrkgLookup: false,
        placeholder: 'Search for a paper by title',
        contentType: 'all',
        inputId: '',
    },
    render: (args) => {
        const [value, setValue] = useState<string>(args.value ?? '');
        return (
            <PaperTitleInput
                {...args}
                value={value}
                onChange={(next) => {
                    args.onChange?.(next);
                    setValue(next);
                }}
            />
        );
    },
};
