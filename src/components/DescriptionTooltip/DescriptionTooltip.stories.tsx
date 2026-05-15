import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { StoryFn } from '@storybook/nextjs-vite';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';

export default {
    title: 'DescriptionTooltip',
    component: DescriptionTooltip,
};

const Template: StoryFn<typeof DescriptionTooltip> = (args) => <DescriptionTooltip {...args} />;

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
        <>
            <hr className="my-1.5 border-border" />
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted shrink-0">Extra row</span>
                <span>more information</span>
            </div>
        </>
    ),
};

export const Buttons = Template.bind({});
Buttons.args = {
    children: 'Resource name',
    id: 'R100',
    buttons: [
        { title: 'Edit', icon: faPencil, color: 'secondary', action: () => {} },
        { title: 'Delete', icon: faTrash, color: 'danger', action: () => {} },
    ],
};
