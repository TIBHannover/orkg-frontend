import Latex from 'components/ValuePlugins/Latex/Latex';

export default {
    title: 'ValuePlugins/Latex',
    component: Latex,
};

const Template = args => <Latex {...args} />;

export const Default = Template.bind({});

Default.args = {
    children: '$$lim_{x \\to infty} \\exp(-x) = O$$',
    type: 'literal',
};
