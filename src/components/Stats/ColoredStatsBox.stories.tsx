import { StoryFn } from '@storybook/nextjs';

import ColoredStatsBox from '@/components/Stats/ColoredStatsBox';

export default {
    title: 'ColoredStatsBox',
    component: ColoredStatsBox,
};

const Template: StoryFn<typeof ColoredStatsBox> = (args) => <ColoredStatsBox {...args} />;

export const Default = Template.bind({});

Default.args = {
    label: 'Papers',
    number: 150,
    className: '',
    isLoading: false,
    link: 'https://orkg.org/papers',
};

export const WithoutLink = Template.bind({});

WithoutLink.args = {
    label: 'Papers',
    number: 150,
    className: '',
    isLoading: false,
};

export const IsLoading = Template.bind({});

IsLoading.args = {
    label: 'Papers',
    number: 150,
    className: '',
    isLoading: true,
    link: 'https://orkg.org/papers',
};
