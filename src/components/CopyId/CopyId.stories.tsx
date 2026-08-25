import { faCalendar, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StoryFn } from '@storybook/nextjs-vite';

import CopyId from '@/components/CopyId/CopyId';

export default {
    title: 'CopyId',
    component: CopyId,
};

const Template: StoryFn<typeof CopyId> = (args) => <CopyId {...args} />;

export const Default = Template.bind({});
Default.args = {
    id: 'R100',
};

export const Compact = Template.bind({});
Compact.args = {
    id: 'R100',
    size: 'xs',
};

export const Large = Template.bind({});
Large.args = {
    id: 'R100',
    size: 'lg',
};

export const FullWidth = Template.bind({});
FullWidth.args = {
    id: 'R100',
    fullWidth: true,
};

/** The `xs` variant sitting in a card metadata row: the only bordered element among plain text items */
export const CompactInCardRow: StoryFn<typeof CopyId> = () => (
    <div className="flex max-w-xl flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="inline-flex items-center">
            <FontAwesomeIcon icon={faCalendar} size="sm" className="me-1 text-muted" />
            21 Nov 2025
        </span>
        <span aria-hidden className="select-none text-border">
            |
        </span>
        <span className="inline-flex items-center">
            <FontAwesomeIcon icon={faTags} size="sm" className="me-1 text-muted" />
            Resource
        </span>
        <span aria-hidden className="select-none text-border">
            |
        </span>
        <div className="flex max-w-[11rem]">
            <CopyId id="R8199" size="xs" />
        </div>
    </div>
);
