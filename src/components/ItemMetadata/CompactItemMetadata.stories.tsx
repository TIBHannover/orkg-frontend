import { StoryFn } from '@storybook/nextjs-vite';

import CompactItemMetadata from '@/components/ItemMetadata/CompactItemMetadata';
import { CERTAINTY } from '@/constants/contentTypes';
import { EXTRACTION_METHODS } from '@/constants/misc';

export default {
    title: 'ItemMetadata/CompactItemMetadata',
    component: CompactItemMetadata,
};

const resource = {
    id: 'R100',
    label: 'Example label',
    classes: ['Dataset'],
    created_at: '2026-08-06T14:03:00Z',
    created_by: '00000000-0000-0000-0000-000000000000',
};

const Template: StoryFn<typeof CompactItemMetadata> = (args) => (
    <div className="border border-divider p-4">
        <CompactItemMetadata {...args} />
    </div>
);

export const Default = Template.bind({});

Default.args = {
    item: resource,
    showCreatedAt: true,
    showCreatedBy: true,
    showClasses: true,
};

/** Everything at once: the widest a card footer ever gets */
export const AllItems = Template.bind({});

AllItems.args = {
    item: {
        ...resource,
        classes: ['Dataset', 'Comparison'],
        certainty: CERTAINTY.MODERATE,
        extraction_method: EXTRACTION_METHODS.MANUAL,
        shared: 12,
    },
    showCreatedAt: true,
    showCreatedBy: true,
    showClasses: true,
    showCertainty: true,
    showExtractionMethod: true,
};

/** Rosetta statements are keyed by UUID: the ID pill truncates instead of eating the row */
export const LongId = Template.bind({});

LongId.args = {
    item: { ...resource, id: '4a15c351-a2a9-44a0-a121-06b02a7e840a', certainty: CERTAINTY.MODERATE },
    showCreatedAt: true,
    showCreatedBy: true,
    showCertainty: true,
};

/** Literals carry a datatype instead of classes */
export const Literal = Template.bind({});

Literal.args = {
    item: { id: 'L100', label: '42', datatype: 'xsd:integer' },
    showDataType: true,
};

/** Classes carry an external URI, which links out and truncates rather than pushing the row */
export const ClassWithUri = Template.bind({});

ClassWithUri.args = {
    item: { id: 'C8', label: 'qb:DataStructureDefinition', uri: 'http://purl.org/linked-data/cube#DataStructureDefinition' },
    showCreatedAt: true,
    showUri: true,
};

/** The backend hands out the string `'null'` for classes without a URI: no item either way */
export const ClassWithoutUri = Template.bind({});

ClassWithoutUri.args = {
    item: { ...resource, uri: 'null' },
    showCreatedAt: true,
    showUri: true,
};

/** An unknown extraction method is dropped rather than rendered as "Unknown" */
export const UnknownExtractionMethod = Template.bind({});

UnknownExtractionMethod.args = {
    item: { ...resource, extraction_method: EXTRACTION_METHODS.UNKNOWN },
    showCreatedAt: true,
    showExtractionMethod: true,
};

/** Consumers can append their own items through `children` */
export const WithExtraItem = Template.bind({});

WithExtraItem.args = {
    item: resource,
    showCreatedAt: true,
    children: <span>Versions</span>,
};

/** Without an ID the row simply ends at the last text item */
export const WithoutId = Template.bind({});

WithoutId.args = {
    item: resource,
    showCreatedAt: true,
    showCreatedBy: true,
    showClasses: true,
    showId: false,
};
