import { StoryFn } from '@storybook/react';

import StepContainer from '@/components/StepContainer';

export default {
    title: 'StepContainer',
    component: StepContainer,
};

const Template: StoryFn<typeof StepContainer> = (args) => (
    <>
        <StepContainer {...args} />
        <StepContainer step="2" topLine bottomLine />
        <StepContainer step="3" topLine />
    </>
);

export const Default = Template.bind({});

Default.args = {
    step: '1',
    title: 'The first step',
    topLine: false,
    bottomLine: true,
    active: true,
    children: 'Content of the first step',
};
