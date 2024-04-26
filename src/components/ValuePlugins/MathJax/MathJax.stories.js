import MathJax from 'components/ValuePlugins/MathJax/MathJax';

export default {
    title: 'ValuePlugins/MathJax',
    component: MathJax,
};

const Template = (args) => <MathJax {...args} />;

export const Default = Template.bind({});

Default.args = {
    children: '$$lim_{x \\to infty} \\exp(-x) = O$$',
    type: 'literal',
};
