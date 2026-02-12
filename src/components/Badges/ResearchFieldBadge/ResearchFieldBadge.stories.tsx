import { StoryFn } from '@storybook/nextjs';

import ResearchFieldBadgeComponent from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Badges/ResearchFieldBadge',
    component: ResearchFieldBadgeComponent,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<typeof ResearchFieldBadgeComponent> = (args) => <ResearchFieldBadgeComponent {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
    researchField: {
        id: 'R100',
        label: 'Computer Science',
    },
};
