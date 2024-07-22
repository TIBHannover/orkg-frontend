import { StoryFn } from '@storybook/react';
import MapComponent from 'components/ValuePlugins/Map/Map';
import { ENTITIES } from 'constants/graphSettings';

export default {
    title: 'ValuePlugins/Map',
    component: MapComponent,
    argTypes: {
        type: {
            control: {
                type: 'select',
                options: [ENTITIES.RESOURCE, ENTITIES.LITERAL],
            },
        },
        children: {
            control: 'text',
        },
    },
};

const Template: StoryFn<typeof MapComponent> = (args) => <MapComponent {...args} />;

export const ResourceMap = Template.bind({});
ResourceMap.args = {
    children: 'Point(9.722251086601805 52.375483686755416)', // Coordinates for Hannover
    type: ENTITIES.RESOURCE,
};

export const LiteralMap = Template.bind({});
LiteralMap.args = {
    children: 'Point(-118.243683 34.052235)', // Coordinates for Los Angeles
    type: ENTITIES.LITERAL,
};

export const InvalidCoordinates = Template.bind({});
InvalidCoordinates.args = {
    children: 'Invalid coordinates',
    type: ENTITIES.LITERAL,
};
