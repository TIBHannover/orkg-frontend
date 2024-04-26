import CopyId from 'components/CopyId/CopyId';

export default {
    title: 'CopyId',
    component: CopyId,
};

const Template = (args) => <CopyId {...args} />;

export const Default = Template.bind({});
Default.args = {
    id: 'R100',
};
