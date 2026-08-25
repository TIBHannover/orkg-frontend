import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { StoryFn } from '@storybook/nextjs-vite';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import EntityCard from '@/components/Cards/EntityCard/EntityCard';
import ListGroup from '@/components/Ui/List/ListGroup';

export default {
    title: 'Cards/EntityCard',
    component: EntityCard,
};

const resource = {
    id: 'R100',
    label: 'Example label',
    classes: ['Dataset'],
    created_at: '2026-08-06T14:03:00Z',
    created_by: '00000000-0000-0000-0000-000000000000',
};

const Template: StoryFn<typeof EntityCard> = (args) => (
    <ListGroup>
        <EntityCard {...args} />
    </ListGroup>
);

export const Default = Template.bind({});

Default.args = {
    href: '/resource/R100',
    item: resource,
};

export const WithoutLabel = Template.bind({});

WithoutLabel.args = {
    href: '/resource/R100',
    item: { ...resource, label: '' },
};

export const WithBadge = Template.bind({});

WithBadge.args = {
    href: '/resource/R100',
    item: resource,
    badge: <CardBadge>Dataset</CardBadge>,
};

/** Draft listings show the date and the ID, but no contributor: it is always the signed-in user */
export const WithoutContributor = Template.bind({});

WithoutContributor.args = {
    href: '/review/R100',
    label: 'My draft review',
    item: resource,
    showCreatedBy: false,
};

/** Row actions collapse into the shell's overflow menu — the pattern draft listings use for delete */
export const WithMenuActions = Template.bind({});

WithMenuActions.args = {
    href: '/comparison/R100',
    label: 'My draft comparison',
    item: resource,
    showCreatedBy: false,
    menuActions: [{ key: 'delete', label: 'Delete', icon: faTrash, isDanger: true, onAction: () => {} }],
};

/** Without an `item` the row is just a title link, e.g. when the metadata is not available */
export const WithoutMetadata = Template.bind({});

WithoutMetadata.args = {
    href: '/resource/R100',
    label: 'Example label',
};

const TemplateWithinList: StoryFn<typeof EntityCard> = (args) => (
    <ListGroup>
        <EntityCard {...args} />
        <EntityCard {...args} />
        <EntityCard {...args} />
    </ListGroup>
);

export const WithinList = TemplateWithinList.bind({});

WithinList.args = {
    href: '/resource/R100',
    item: resource,
};
