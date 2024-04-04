import ShareCreatedContent from 'components/ShareLinkMarker/ShareCreatedContent';

export default {
    title: 'ShareCreatedContent',
    component: ShareCreatedContent,
};

const Template = (args) => <ShareCreatedContent {...args} />;

export const Default = Template.bind({});

Default.args = {
    typeOfLink: 'paper',
    title: 'Open research knowledge graph: next generation infrastructure for semantic scholarly knowledge',
};
