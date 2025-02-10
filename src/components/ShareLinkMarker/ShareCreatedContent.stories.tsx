import { StoryFn } from '@storybook/react';
import ShareCreatedContent from 'components/ShareLinkMarker/ShareCreatedContent';

export default {
    title: 'ShareCreatedContent',
    component: ShareCreatedContent,
};

const Template: StoryFn<typeof ShareCreatedContent> = (args) => <ShareCreatedContent {...args} />;

export const Default = Template.bind({});

Default.args = {
    typeOfLink: 'paper',
    title: 'Open research knowledge graph: next generation infrastructure for semantic scholarly knowledge',
};
