import PublishedInInput from '@/components/Input/PublishedInInput/PublishedInInput';

export default {
    title: 'Input/PublishedInInput',
    component: PublishedInInput,
};

const Template = (args) => <PublishedInInput {...args} />;

export const Default = Template.bind({});

Default.args = {
    value: '',
    onChange: () => {},
    inputId: '',
};
