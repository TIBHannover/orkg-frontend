import { StoryFn } from '@storybook/nextjs-vite';

import Math from '@/components/ValuePlugins/Math/Math';

export default {
    title: 'ValuePlugins/Math',
    component: Math,
};

const Template: StoryFn<typeof Math> = (args) => <Math {...args} />;

export const Default = Template.bind({});

Default.args = {
    text: '$$lim_{x \\to infty} \\exp(-x) = O$$',
};
