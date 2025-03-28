import { StoryFn } from '@storybook/react';

import ImageAsFigure from '@/components/ValuePlugins/Images/ImageAsFigures';
import { ENTITIES } from '@/constants/graphSettings';

const NODE_TYPES = [ENTITIES.RESOURCE, ENTITIES.LITERAL];

export default {
    title: 'ValuePlugins/ImagesAsFigure',
    component: ImageAsFigure,
    argTypes: {
        type: {
            options: Object.values(NODE_TYPES),
        },
    },
};

const Template: StoryFn<typeof ImageAsFigure> = (args) => <ImageAsFigure {...args} />;

export const Default = Template.bind({});

Default.args = {
    text: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg',
};
