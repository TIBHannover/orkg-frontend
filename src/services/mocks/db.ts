import { factory, nullable, primaryKey } from '@mswjs/data';

const thing = {
    id: primaryKey(String),
    modifiable: Boolean,
    _class: String,
};

const provenance = {
    created_at: Date,
    created_by: String,
    observatory_id: String,
    extraction_method: String,
    organization_id: String,
};

const contentType = {
    featured: Boolean,
    unlisted: Boolean,
    verified: Boolean,
    unlistedBy: String,
};

// Define user model
const models = {
    literals: {
        ...thing,
        ...provenance,
        label: String,
        datatype: String,
        _class: () => 'literal',
    },
    classes: {
        ...thing,
        ...provenance,
        label: String,
        uri: nullable(String),
        description: nullable(String),
        _class: () => 'class',
    },
    predicates: {
        ...thing,
        ...provenance,
        label: String,
        created_at: Date,
        created_by: String,
        _class: () => 'predicate',
    },
    resources: {
        ...thing,
        ...provenance,
        ...contentType,
        label: String,
        // it's a string because msw/data doesn't support querying data on arrays https://github.com/mswjs/data?tab=readme-ov-file#querying-data
        classes: String,
        shared: Number,
        formatted_label: String,
        _class: () => 'resource',
    },
    statements: {
        ...provenance,
        id: primaryKey(String),
        subject: String,
        predicate: String,
        object: String,
    },
    lists: {
        ...thing,
        ...provenance,
        label: String,
        elements: Array,
        _class: () => 'list',
    },
};

const db = factory(models);

export default db;
