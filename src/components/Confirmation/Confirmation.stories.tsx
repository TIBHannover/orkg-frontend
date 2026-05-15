import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Confirm from '@/components/Confirmation/Confirmation';

type DemoProps = {
    message?: string;
    title?: string;
    proceedLabel?: string;
    cancelLabel?: string;
};

const Demo = (props: DemoProps) => {
    const handleConfirm = async () => {
        await Confirm({ ...props });
    };
    return (
        <button type="button" onClick={handleConfirm}>
            Trigger confirm
        </button>
    );
};

const meta: Meta<typeof Demo> = {
    title: 'Confirmation',
    component: Demo,
};

export default meta;
type Story = StoryObj<typeof Demo>;

export const Default: Story = {
    args: {
        message: 'Deleting is permanent. Are you sure you want to delete this item?',
        title: 'Are you sure?',
        proceedLabel: 'Ok',
        cancelLabel: 'Cancel',
    },
    parameters: {
        docs: {
            source: {
                code: `const confirm = await Confirm({
    message: '',
    title: '',
    proceedLabel: '',
    cancelLabel: '',
});

if (confirm) {
    // Proceed
})`,
            },
        },
    },
};
