import { faInfo, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { StoryFn } from '@storybook/nextjs-vite';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import CompactItemMetadata from '@/components/ItemMetadata/CompactItemMetadata';
import ListGroup from '@/components/Ui/List/ListGroup';

export default {
    title: 'Cards/CardShell',
    component: CardShell,
};

const resource = {
    id: 'R100',
    label: 'Example label',
    classes: ['Dataset'],
    created_at: '2026-08-06T14:03:00Z',
    created_by: '00000000-0000-0000-0000-000000000000',
};

const Template: StoryFn<typeof CardShell> = (args) => (
    <ListGroup>
        <CardShell {...args} />
    </ListGroup>
);

export const Default = Template.bind({});

Default.args = {
    children: <div>A card body is whatever the content type needs it to be</div>,
    footer: <CompactItemMetadata item={resource} showCreatedAt showCreatedBy showClasses />,
};

/** The actions column is a sibling of the body, so wrapping text never runs under the buttons */
export const WithActions = Template.bind({});

WithActions.args = {
    children: (
        <div>
            A long body that wraps across several lines to show that the action column keeps its own space no matter how much text the card carries,
            all the way to the end of the second line and beyond
        </div>
    ),
    footer: <CompactItemMetadata item={resource} showCreatedAt showCreatedBy />,
    actions: (
        <>
            <ActionButtonView title="Edit" icon={faPen} />
            <ActionButtonView title="Information" icon={faInfo} />
        </>
    ),
};

/** Row actions live in the overflow menu: one muted trigger per card, destructive entries styled as danger inside */
export const WithActionsMenu = Template.bind({});

WithActionsMenu.args = {
    children: <div>A draft comparison the owner can delete</div>,
    footer: <CompactItemMetadata item={resource} showCreatedAt />,
    menuActions: [
        { key: 'edit', label: 'Edit', icon: faPen, onAction: () => {} },
        { key: 'delete', label: 'Delete', icon: faTrash, isDanger: true, onAction: () => {} },
    ],
};

/** Body only: no footer, no actions */
export const BodyOnly = Template.bind({});

BodyOnly.args = {
    children: <div>Just a body</div>,
};

/** Content types compose `CardColumns` as the body: main column + curation gutter + breadcrumbs/contributor aside */
export const ContentTypeBody = Template.bind({});

ContentTypeBody.args = {
    children: (
        <CardColumns
            gutter={<span title="curation flags">★</span>}
            researchField={{ id: 'R11', label: 'Science' }}
            createdBy="00000000-0000-0000-0000-000000000000"
        >
            <div className="mb-2">A paper title</div>
            <small>Authors, publication date, description…</small>
        </CardColumns>
    ),
};

/** `asListItem={false}` renders a div, for the rare card shown outside a `ListGroup` */
export const Standalone: StoryFn<typeof CardShell> = (args) => (
    <div className="border border-divider">
        <CardShell {...args} />
    </div>
);

Standalone.args = {
    asListItem: false,
    children: <div>Not inside a list</div>,
    footer: <CompactItemMetadata item={resource} showCreatedAt showCreatedBy />,
};

/** Row separation comes from the `ListGroup` parent, so stacked shells divide themselves */
const TemplateWithinList: StoryFn<typeof CardShell> = (args) => (
    <ListGroup>
        <CardShell {...args} />
        <CardShell {...args} />
        <CardShell {...args} />
    </ListGroup>
);

export const WithinList = TemplateWithinList.bind({});

WithinList.args = {
    children: <div>Example label</div>,
    footer: <CompactItemMetadata item={resource} showCreatedAt showCreatedBy showClasses />,
};
