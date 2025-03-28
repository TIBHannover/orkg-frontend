import { StoryFn } from '@storybook/react';

import MathJax from '@/components/ValuePlugins/MathJax/MathJax';

export default {
    title: 'ValuePlugins/MathJax',
    component: MathJax,
};

const Template: StoryFn<typeof MathJax> = (args) => <MathJax {...args} />;

export const Default = Template.bind({});

Default.args = {
    text: '$$lim_{x \\to infty} \\exp(-x) = O$$',
};
