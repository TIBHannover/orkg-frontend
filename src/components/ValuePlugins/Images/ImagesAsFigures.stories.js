import ImagesAsFigures from 'components/ValuePlugins/Images/ImagesAsFigures';
import { ENTITIES } from 'constants/graphSettings';

const NODE_TYPES = [ENTITIES.RESOURCE, ENTITIES.LITERAL];

export default {
    title: 'ValuePlugins/ImagesAsFigures',
    component: ImagesAsFigures,
    argTypes: {
        type: {
            options: Object.values(NODE_TYPES),
        },
    },
};

const Template = args => <ImagesAsFigures {...args} />;

export const Default = Template.bind({});

Default.args = {
    children: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg',
    type: 'literal',
};
