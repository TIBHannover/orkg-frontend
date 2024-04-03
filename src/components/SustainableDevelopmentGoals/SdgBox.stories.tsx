import type { Meta, StoryObj } from '@storybook/react';
import SdgBox from 'components/SustainableDevelopmentGoals/SdgBox';

const meta: Meta<typeof SdgBox> = {
    title: 'SDG Box',
    component: SdgBox,
    argTypes: {
        handleSave: { action: 'button clicked' },
    },
};

export default meta;
type Story = StoryObj<typeof SdgBox>;

export const Primary: Story = {
    args: {
        sdgs: [
            {
                id: 'SDG_1',
                label: 'No Poverty',
            },
            {
                id: 'SDG_2',
                label: 'Zero Hunger',
            },
            {
                id: 'SDG_3',
                label: 'Good Health and Well-being',
            },
            {
                id: 'SDG_4',
                label: 'Quality Education',
            },
        ],
        isEditable: true,
    },
};
