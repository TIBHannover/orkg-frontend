import { z, ZodType } from 'zod';

import { preprocessNumber } from '@/constants/DataTypes';
import { CLASSES, ENTITIES, MISC, RESOURCES } from '@/constants/graphSettings';
import { createClass, getClassById } from '@/services/backend/classes';
import { createList, getList } from '@/services/backend/lists';
import { createLiteral, getLiteral, updateLiteral } from '@/services/backend/literals';
import { createPredicate, getPredicate } from '@/services/backend/predicates';
import { createResource, getResource, updateResource } from '@/services/backend/resources';
import { Class, EntityType, Node, Predicate, PropertyShape, Resource, Statement, Template } from '@/services/backend/types';

export const prioritizeDescriptionStatements = (_statements: Record<string, Statement[]>) => {
    const orderedKeys = Object.keys(_statements).sort((a, b) => {
        // Put description predicates first
        if (a.toLowerCase().includes('description')) return -1;
        if (b.toLowerCase().includes('description')) return 1;
        // Then sort alphabetically
        return a.localeCompare(b);
    });
    return orderedKeys;
};

export const getListPropertiesFromTemplate = (template: Template, required = false) => {
    if (required) {
        return template.properties.filter((ps) => ps.min_count && (ps.min_count as number) > 0).map((ps) => ps.path);
    }
    return template.properties.filter((ps) => !ps.min_count || ps.min_count === 0).map((ps) => ps.path);
};

export const getPropertyShapesByPredicateID = (template: Template, predicateId: string) => {
    return template.properties.filter((ps) => ps.path.id === predicateId);
};

const MAX_DB_LEVEL = 10;

/**
 * Returns a CSS var reference so the color follows the active theme.
 */
export const getBackgroundColor = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), MAX_DB_LEVEL);
    return `var(--db-level-${clamped})`;
};

/**
 * Check if the property shapes has a literal datatype
 *  (if one of the default data type: Date, String, Number)
 */
export const isLiteral = (propertyShapes: PropertyShape[]) => {
    return !!propertyShapes.find((ps) => 'datatype' in ps && ps.datatype?.id);
};

export const createValue = async (_class: EntityType | 'empty', value: Resource | Predicate | Node | { label: string; datatype: string } | Class) => {
    let apiCall;
    switch (_class) {
        case ENTITIES.RESOURCE:
            if ('datatype' in value && value.datatype === 'list') {
                apiCall = getList(await createList({ label: value.label, elements: [] }));
            } else if ('datatype' in value && value.datatype === 'table') {
                apiCall = getResource(await createResource({ label: value.label, classes: [CLASSES.CSVW_TABLE] }));
            } else {
                apiCall = getResource(
                    await createResource({ label: value.label, classes: 'classes' in value && value.classes ? value.classes : [] }),
                );
            }
            break;
        case ENTITIES.PREDICATE:
            apiCall = getPredicate(await createPredicate(value.label));
            break;
        case ENTITIES.LITERAL:
            apiCall = getLiteral(await createLiteral(value.label, 'datatype' in value ? value.datatype : MISC.DEFAULT_LITERAL_DATATYPE));
            break;
        case ENTITIES.CLASS:
            apiCall = getClassById(await createClass(value.label));
            break;
        case 'empty':
            apiCall = getResource(RESOURCES.EMPTY_RESOURCE);
            break;
        default:
            apiCall = getLiteral(await createLiteral(value.label, 'datatype' in value ? value.datatype : MISC.DEFAULT_LITERAL_DATATYPE));
    }
    return apiCall;
};

export const commitChangeLabel = (valueId: string, _class: EntityType, label: string, datatype: string) => {
    const apiCall = _class === ENTITIES.LITERAL ? updateLiteral(valueId, label, datatype) : updateResource(valueId, { label });
    return apiCall;
};

export const getResourceFromStatementsById = (id: string, statements: Statement[]) => {
    let resource = statements.find((s) => s.subject.id === id);
    if (resource) {
        return resource.subject;
    }
    if (!resource) {
        resource = statements.find((s) => s.object.id === id);
    }
    if (resource) {
        return resource.object;
    }
    return undefined;
};

export const getStatementsBySubjectId = (id: string, statements: Statement[]) => {
    return statements.filter((s) => s.subject.id === id);
};

export const convertPropertyShapeToSchema = (propertyShape: PropertyShape) => {
    // Start with base schema based on the first validation rule
    let baseSchema: ZodType;
    if ('min_inclusive' in propertyShape && 'max_inclusive' in propertyShape && propertyShape.min_inclusive && propertyShape.max_inclusive) {
        baseSchema = z.preprocess(
            preprocessNumber,
            z
                .number()
                .gte(propertyShape.min_inclusive)
                .lte(propertyShape.max_inclusive)
                .refine((value) => !Number.isNaN(value), { message: 'Invalid input: must be a valid number' }),
        );
    } else if ('min_inclusive' in propertyShape && propertyShape.min_inclusive) {
        baseSchema = z.preprocess(
            preprocessNumber,
            z
                .number()
                .gte(propertyShape.min_inclusive)
                .refine((value) => !Number.isNaN(value), { message: 'Invalid input: must be a valid number' }),
        );
    } else if ('max_inclusive' in propertyShape && propertyShape.max_inclusive) {
        baseSchema = z.preprocess(
            preprocessNumber,
            z
                .number()
                .lte(propertyShape.max_inclusive)
                .refine((value) => !Number.isNaN(value), { message: 'Invalid input: must be a valid number' }),
        );
    } else if ('pattern' in propertyShape && propertyShape.pattern) {
        baseSchema = z.string().regex(new RegExp(propertyShape.pattern)).describe(propertyShape.path.label);
    } else {
        return z.any();
    }

    return baseSchema;
};

export default getListPropertiesFromTemplate;
