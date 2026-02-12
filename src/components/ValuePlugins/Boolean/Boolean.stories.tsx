import { StoryFn } from '@storybook/nextjs';

import Boolean from '@/components/ValuePlugins/Boolean/Boolean';

export default {
    title: 'ValuePlugins/Boolean',
    component: Boolean,
};

const Template: StoryFn<typeof Boolean> = (args) => <Boolean {...args} />;

export const Default = Template.bind({});

Default.args = {
    text: 'true',
};
