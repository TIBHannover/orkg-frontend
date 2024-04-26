import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';

export default {
    title: 'DescriptionTooltip',
    component: DescriptionTooltip,
};

const Template = (args) => <DescriptionTooltip {...args} />;

export const Default = Template.bind({});
Default.args = {
    children: 'Resource name',
    id: 'R100',
};

export const Disabled = Template.bind({});
Disabled.args = {
    children: 'Resource name',
    id: 'R100',
    disabled: true,
};

export const InstanceResource = Template.bind({});
InstanceResource.args = {
    children: 'Resource name',
    id: 'R100',
    classes: ['Paper'],
};

export const ShowURL = Template.bind({});
ShowURL.args = {
    children: 'Resource name',
    id: 'R100',
    showURL: true,
};

export const ExtraContent = Template.bind({});
ExtraContent.args = {
    children: 'Resource name',
    id: 'R100',
    extraContent: (
        <tr>
            <td>Extra row</td>
            <td>more information</td>
        </tr>
    ),
};
