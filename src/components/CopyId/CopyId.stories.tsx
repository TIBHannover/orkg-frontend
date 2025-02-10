import { StoryFn } from '@storybook/react';
import CopyId from 'components/CopyId/CopyId';

export default {
    title: 'CopyId',
    component: CopyId,
};

const Template: StoryFn<typeof CopyId> = (args) => <CopyId {...args} />;

export const Default = Template.bind({});
Default.args = {
    id: 'R100',
};
