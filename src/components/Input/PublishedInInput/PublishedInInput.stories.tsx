import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PublishedInInput from '@/components/Input/PublishedInInput/PublishedInInput';

const meta: Meta<typeof PublishedInInput> = {
    title: 'Input/PublishedInInput',
    component: PublishedInInput,
};

export default meta;
type Story = StoryObj<typeof PublishedInInput>;

export const Default: Story = {
    args: {
        value: '',
        onChange: () => {},
        inputId: '',
    },
};
