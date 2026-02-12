import { StoryFn } from '@storybook/nextjs';

import Video from '@/components/ValuePlugins/Video/Video';
import { ENTITIES } from '@/constants/graphSettings';

const NODE_TYPES = [ENTITIES.RESOURCE, ENTITIES.LITERAL];

export default {
    title: 'ValuePlugins/Video',
    component: Video,
    argTypes: {
        type: {
            options: Object.values(NODE_TYPES),
        },
    },
};

const Template: StoryFn<typeof Video> = (args) => <Video {...args} />;

export const Youtube = Template.bind({});

Youtube.args = {
    text: 'https://www.youtube.com/watch?v=d3AqXwPIiGc',
};

export const TibAvPortal = Template.bind({});

TibAvPortal.args = {
    text: 'https://av.tib.eu/media/16120',
};
