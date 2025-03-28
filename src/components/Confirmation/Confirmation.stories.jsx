import Confirm from '@/components/Confirmation/Confirmation';

const Demo = (props) => {
    const handleConfirm = async () => {
        await Confirm({
            ...props,
        });
    };
    return <button onClick={handleConfirm}>Trigger confirm</button>;
};

export default {
    title: 'Confirmation',
    component: Demo,
};

const Template = (args) => <Demo {...args} />;

export const Default = Template.bind({});
Default.args = {
    message: 'Deleting is permanent. Are you sure you want to delete this item?',
    title: 'Are you sure?',
    proceedLabel: 'Ok',
    cancelLabel: 'Cancel',
};

Default.parameters = {
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
};
