import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import PublicationYearInput from '@/components/Input/PublicationYearInput/PublicationYearInput';

const meta: Meta<typeof PublicationYearInput> = {
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

export default meta;
type Story = StoryObj<typeof PublicationYearInput>;

export const Default: Story = {
    args: {
        value: '',
        inputId: '',
    },
    render: (args) => {
        const [value, setValue] = useState<string>(args.value ?? '');
        return (
            <PublicationYearInput
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
