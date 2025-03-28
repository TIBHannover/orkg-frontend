import { StoryFn } from '@storybook/react';

import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';

export default {
    title: 'EditModeHeader',
    component: EditModeHeader,
};

const Template: StoryFn<typeof EditModeHeader> = (args) => <EditModeHeader {...args} />;

export const Default = Template.bind({});

Default.args = {
    isVisible: true,
};

export const CustomMessage = Template.bind({});

CustomMessage.args = {
    isVisible: true,
    message: 'Custom message',
};
