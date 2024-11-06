import { StoryFn } from '@storybook/react';
import ResearchFieldInput from 'components/Input/ResearchFieldInput/ResearchFieldInput';

export default {
    title: 'Input/ResearchFieldInput',
    component: ResearchFieldInput,
};

const Template: StoryFn<typeof ResearchFieldInput> = (args) => <ResearchFieldInput {...args} />;

export const Default = Template.bind({});

Default.args = {
    value: null,
    onChange: () => {},
    inputId: '',
};
