import { factory, nullable, primaryKey } from '@mswjs/data';

const thing = {
    id: primaryKey(String),
    modifiable: Boolean,
    _class: String,
};

const provenanceCommon = {
    created_at: Date,
    created_by: String,
};

const provenanceObservatory = {
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
        ...provenanceCommon,
        label: String,
        datatype: String,
        _class: () => 'literal',
    },
    classes: {
        ...thing,
        ...provenanceCommon,
        label: String,
        uri: nullable(String),
        description: nullable(String),
        _class: () => 'class',
    },
    predicates: {
        ...thing,
        ...provenanceCommon,
        label: String,
        created_at: Date,
        created_by: String,
        _class: () => 'predicate',
    },
    resources: {
        ...thing,
        ...provenanceCommon,
        ...provenanceObservatory,
        ...contentType,
        label: String,
        // it's a string because msw/data doesn't support querying data on arrays https://github.com/mswjs/data?tab=readme-ov-file#querying-data
        classes: String,
        shared: Number,
        formatted_label: String,
        _class: () => 'resource',
    },
    statements: {
        ...provenanceCommon,
        ...provenanceObservatory,
        id: primaryKey(String),
        subject: String,
        predicate: String,
        object: String,
    },
    lists: {
        ...thing,
        ...provenanceCommon,
        label: String,
        elements: Array,
        _class: () => 'list',
    },
};

const db = factory(models);

export default db;
