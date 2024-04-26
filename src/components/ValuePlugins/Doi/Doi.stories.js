import Doi from 'components/ValuePlugins/Doi/Doi';
import { ENTITIES } from 'constants/graphSettings';

const NODE_TYPES = [ENTITIES.RESOURCE, ENTITIES.LITERAL];

export default {
    title: 'ValuePlugins/Doi',
    component: Doi,
    argTypes: {
        type: {
            options: Object.values(NODE_TYPES),
        },
    },
};

const Template = (args) => <Doi {...args} />;

export const Default = Template.bind({});

Default.args = {
    children: '10.1145/3360901.3364435',
    type: 'literal',
};
