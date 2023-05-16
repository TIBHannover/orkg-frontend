import Video from 'components/ValuePlugins/Video/Video';
import { ENTITIES } from 'constants/graphSettings';

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

const Template = args => <Video {...args} />;

export const Youtube = Template.bind({});

Youtube.args = {
    children: 'https://www.youtube.com/watch?v=d3AqXwPIiGc',
    type: 'literal',
};

export const TibAvPortal = Template.bind({});

TibAvPortal.args = {
    children: 'https://av.tib.eu/media/16120',
    type: 'literal',
};
