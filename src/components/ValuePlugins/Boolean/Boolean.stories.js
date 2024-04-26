import Boolean from 'components/ValuePlugins/Boolean/Boolean';

export default {
    title: 'ValuePlugins/Boolean',
    component: Boolean,
};

const Template = (args) => <Boolean {...args} />;

export const Default = Template.bind({});

Default.args = {
    children: 'true',
};
