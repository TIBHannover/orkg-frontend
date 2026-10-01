import { Collection } from '@msw/data';
import { z } from 'zod';

const thing = {
    id: z.string(),
    modifiable: z.boolean().default(false),
};

const provenanceCommon = {
    created_at: z.string().default(''),
    created_by: z.string().default(''),
};

const provenanceObservatory = {
    observatory_id: z.string().default(''),
    extraction_method: z.string().default(''),
    organization_id: z.string().default(''),
};

const contentType = {
    featured: z.boolean().default(false),
    unlisted: z.boolean().default(false),
    verified: z.boolean().default(false),
    unlistedBy: z.string().default(''),
};

const literalSchema = z.object({
    ...thing,
    ...provenanceCommon,
    label: z.string().default(''),
    datatype: z.string().default(''),
    _class: z.string().default('literal'),
});

const classSchema = z.object({
    ...thing,
    ...provenanceCommon,
    label: z.string().default(''),
    uri: z.string().nullable().default(null),
    description: z.string().nullable().default(null),
    _class: z.string().default('class'),
});

const predicateSchema = z.object({
    ...thing,
    ...provenanceCommon,
    label: z.string().default(''),
    _class: z.string().default('predicate'),
});

const resourceSchema = z.object({
    ...thing,
    ...provenanceCommon,
    ...provenanceObservatory,
    ...contentType,
    label: z.string().default(''),
    // it's a string because @msw/data queries values as-is, and comparing arrays is not supported
    classes: z.string().default(''),
    shared: z.number().default(0),
    formatted_label: z.string().default(''),
    _class: z.string().default('resource'),
});

const statementSchema = z.object({
    ...provenanceCommon,
    ...provenanceObservatory,
    id: z.string(),
    subject: z.string(),
    predicate: z.string(),
    object: z.string(),
});

const listSchema = z.object({
    ...thing,
    ...provenanceCommon,
    label: z.string().default(''),
    elements: z.array(z.string()).default([]),
    _class: z.string().default('list'),
});

const db = {
    literals: new Collection({ schema: literalSchema }),
    classes: new Collection({ schema: classSchema }),
    predicates: new Collection({ schema: predicateSchema }),
    resources: new Collection({ schema: resourceSchema }),
    statements: new Collection({ schema: statementSchema }),
    lists: new Collection({ schema: listSchema }),
};

/** Removes every record from every collection (replaces `drop(db)` from `@mswjs/data`). */
export const resetDb = () => {
    for (const collection of Object.values(db)) {
        collection.clear();
    }
};

export default db;
