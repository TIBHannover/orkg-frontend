import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import PublicationMonthInput from '@/components/Input/PublicationMonthInput/PublicationMonthInput';

const meta: Meta<typeof PublicationMonthInput> = {
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

export default meta;
type Story = StoryObj<typeof PublicationMonthInput>;

export const Default: Story = {
    args: {
        value: '',
        inputId: '',
    },
    render: (args) => {
        const [value, setValue] = useState<string>(args.value ?? '');
        return (
            <PublicationMonthInput
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
