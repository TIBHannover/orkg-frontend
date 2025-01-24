import { StoryFn } from '@storybook/react';
import Link from 'components/ValuePlugins/Link/Link';

export default {
    title: 'ValuePlugins/Link',
    component: Link,
};

const Template: StoryFn<typeof Link> = (args) => <Link {...args} />;

export const Default = Template.bind({});

Default.args = {
    text: 'https://orkg.org',
};
