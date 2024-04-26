import ResearchFieldInput from 'components/Input/ResearchFieldInput/ResearchFieldInput';

export default {
    title: 'Input/ResearchFieldInput',
    component: ResearchFieldInput,
};

const Template = (args) => <ResearchFieldInput {...args} />;

export const Default = Template.bind({});

Default.args = {
    value: '',
    onChange: () => {},
    inputId: '',
};
