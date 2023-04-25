import Link from 'components/ValuePlugins/Link/Link';

export default {
    title: 'ValuePlugins/Link',
    component: Link,
};

const Template = args => <Link {...args} />;

export const Default = Template.bind({});

Default.args = {
    children: 'https://orkg.org',
    type: 'literal',
};
