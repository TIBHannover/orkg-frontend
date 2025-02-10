import { StoryFn } from '@storybook/react';
import AuthorBadgesComponent from 'components/Badges/AuthorBadges/AuthorBadges';

export default {
    title: 'Badges/AuthorBadges',
    component: AuthorBadgesComponent,
};

const Template: StoryFn<typeof AuthorBadgesComponent> = (args) => <AuthorBadgesComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
    authors: [
        {
            id: 'R1',
            name: 'John Doe',
            identifiers: {},
        },
        {
            id: 'R1',
            name: 'Jane Doe',
            identifiers: {},
        },
        {
            id: 'R1',
            name: 'Jane Roe',
            identifiers: {},
        },
    ],
};

export const Single = Template.bind({});
Single.args = {
    authors: [
        {
            id: 'R1',
            name: 'John Doe',
            identifiers: {},
        },
    ],
};
