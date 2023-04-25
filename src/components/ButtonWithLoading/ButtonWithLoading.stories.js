import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';

export default {
    title: 'ButtonWithLoading',
    component: ButtonWithLoading,
};

const Template = args => <ButtonWithLoading {...args} />;

export const Default = Template.bind({});
Default.args = {
    children: 'Submit',
    isLoading: false,
    loadingMessage: 'Loading',
};

export const Loading = Template.bind({});
Loading.args = {
    children: 'Submit',
    isLoading: true,
    loadingMessage: 'Loading',
};

export const CustomStyling = Template.bind({});
CustomStyling.args = {
    children: 'Submit',
    isLoading: false,
    loadingMessage: 'Loading',
    color: 'primary',
    size: 'sm',
};

export const CustomLoadingMessage = Template.bind({});
CustomLoadingMessage.args = {
    children: 'Submit',
    isLoading: true,
    loadingMessage: 'Fetching',
};

export const WithoutLoadingMessage = Template.bind({});
WithoutLoadingMessage.args = {
    children: 'Submit',
    isLoading: true,
    loadingMessage: '',
};
