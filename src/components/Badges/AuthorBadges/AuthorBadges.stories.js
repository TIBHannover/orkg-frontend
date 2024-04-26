import AuthorBadgesComponent from 'components/Badges/AuthorBadges/AuthorBadges';
import { CLASSES } from 'constants/graphSettings';

export default {
    title: 'Badges/AuthorBadges',
    component: AuthorBadgesComponent,
};

const Template = (args) => <AuthorBadgesComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
    authors: [
        {
            id: 'R1',
            label: 'John Doe',
            classes: [CLASSES.AUTHOR],
        },
        {
            id: 'R1',
            label: 'Jane Doe',
            classes: [],
        },
        {
            id: 'R1',
            label: 'Jane Roe',
            classes: [CLASSES.AUTHOR],
        },
    ],
};

export const Single = Template.bind({});
Single.args = {
    authors: [
        {
            id: 'R1',
            label: 'John Doe',
            classes: [CLASSES.AUTHOR],
        },
    ],
};
