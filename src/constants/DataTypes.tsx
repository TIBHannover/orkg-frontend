import { CLASSES, ENTITIES, MISC } from 'constants/graphSettings';
import { z, ZodType } from 'zod';
import { orderBy } from 'lodash';
import { EntityType } from 'services/backend/types';
// https://www.w3.org/TR/xmlschema-2

export type StandardInputType =
    | 'text'
    | 'email'
    | 'select'
    | 'file'
    | 'radio'
    | 'checkbox'
    | 'switch'
    | 'textarea'
    | 'button'
    | 'reset'
    | 'submit'
    | 'date'
    | 'datetime-local'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'range'
    | 'search'
    | 'tel'
    | 'url'
    | 'week'
    | 'password'
    | 'datetime'
    | 'time'
    | 'color';

export type InputType = StandardInputType | 'autocomplete' | 'empty' | 'boolean';

export type DataType = {
    name: string;
    tooltip?: string | JSX.Element;
    type: string;
    _class: EntityType | 'empty';
    classId: string;
    schema: ZodType | null;
    inputFormType: InputType;
    weight: number;
};

export const preprocessNumber = (value: unknown) => {
    if (typeof value === 'string') {
        // Check if the string is purely numeric
        const trimmed = value.trim();
        if (!/^\d+(\.\d+)?$/.test(trimmed)) {
            return NaN; // Return NaN for invalid inputs
        }
        return parseFloat(trimmed); // Coerce valid numeric strings
    }
    return value; // Pass non-strings as is
};

export const preprocessBoolean = (value: unknown) => {
    if (typeof value === 'string') {
        const lowercaseValue = value.toLowerCase();
        if (lowercaseValue === 'true') return true;
        if (lowercaseValue === 'false') return false;
        return undefined; // Invalid case
    }
    return value; // Pass non-strings as is
};

const DATA_TYPES: DataType[] = [
    {
        name: 'Resource',
        tooltip: (
            <>
                Choose Resource to link this to a resource which can contain values on its own. <br /> To fetch an existing resource by ID type “#”
                without quotes following with the resource ID (e.g: #R12).
            </>
        ),
        type: ENTITIES.RESOURCE,
        _class: ENTITIES.RESOURCE,
        classId: CLASSES.RESOURCE,
        schema: z.string(),
        inputFormType: 'autocomplete',
        weight: 0,
    },
    {
        name: 'Text',
        tooltip: 'Choose Text for values like plain text or mathematical expressions using TeX delimiters $$...$$',
        type: MISC.DEFAULT_LITERAL_DATATYPE,
        _class: ENTITIES.LITERAL,
        classId: CLASSES.STRING,
        schema: z.string(),
        inputFormType: 'textarea',
        weight: 0,
    },
    {
        name: 'Decimal',
        type: 'xsd:decimal',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DECIMAL,
        schema: z.preprocess(preprocessNumber, z.number()).refine(
            (value) => !Number.isNaN(value), // Reject NaN values
            { message: 'Invalid input: must be a valid number' },
        ),
        inputFormType: 'text',
        weight: 2,
    },
    {
        name: 'Integer',
        type: 'xsd:integer',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.INTEGER,
        schema: z.preprocess(preprocessNumber, z.number().int()).refine(
            (value) => !Number.isNaN(value), // Reject NaN values
            { message: 'Invalid input: must be a valid integer' },
        ),
        inputFormType: 'text',
        weight: 3,
    },
    {
        name: 'Boolean',
        tooltip: 'Choose Boolean for "true" or "false" value',
        type: 'xsd:boolean',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.BOOLEAN,
        schema: z.preprocess(preprocessBoolean, z.boolean()),
        inputFormType: 'boolean',
        weight: 1,
    },
    {
        name: 'Date',
        type: 'xsd:date',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DATE,
        schema: z.string().date(),
        inputFormType: 'date',
        weight: 1,
    },
    {
        name: 'URL',
        type: 'xsd:anyURI',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.URI,
        schema: z.string().url(),
        inputFormType: 'text',
        weight: 1,
    },
    {
        name: 'Empty',
        tooltip: 'Choose Empty to indicate that no value exists',
        type: 'empty',
        _class: 'empty',
        classId: CLASSES.RESOURCE,
        schema: null,
        inputFormType: 'empty',
        weight: 0,
    },
    {
        name: 'List',
        tooltip: 'Choose List create a list of custom sorted values',
        type: 'list',
        _class: ENTITIES.RESOURCE,
        classId: CLASSES.LIST,
        schema: z.string(),
        inputFormType: 'autocomplete',
        weight: 0,
    },
];
/*
{
    name: 'Class',
    type: ENTITIES.CLASS,
    _class: ENTITIES.CLASS,
    classId: CLASSES.CLASS,
    schema: z.string(),
    inputFormType: 'autocomplete',
    weight: 0
},
{
    name: 'Property',
    type: ENTITIES.PREDICATE,
    _class: ENTITIES.PREDICATE,
    classId: CLASSES.PREDICATE,
    schema: z.string(),
    inputFormType: 'autocomplete',
    weight: 0
} */

export const getConfigByType = (type: string) =>
    DATA_TYPES.find((dt) => dt.type === type) || (DATA_TYPES.find((dt) => dt.type === MISC.DEFAULT_LITERAL_DATATYPE) as DataType);

export const getConfigByClassId = (classId: string) =>
    DATA_TYPES.find((dt) => dt.classId === classId) || {
        name: 'Resource',
        type: ENTITIES.RESOURCE,
        _class: ENTITIES.RESOURCE,
        classId,
        schema: z.string(),
        inputFormType: 'autocomplete',
        weight: 0,
    };

export const getSuggestionByTypeAndValue = (type: string, value: string) => {
    const suggestions = DATA_TYPES.filter((dt) => dt.type !== type)
        .filter((dt) => {
            let error;
            if (dt.schema) {
                error = dt.schema.safeParse(value).error;
            }
            return !error || error.errors.length === 0;
        })
        .filter((dt) => getConfigByType(type).weight < dt.weight);

    return orderBy(suggestions, ['weight'], ['desc']);
};

export const getSuggestionByValue = (value: string) =>
    orderBy(
        DATA_TYPES.filter((dataType) => dataType.type !== ENTITIES.RESOURCE).filter((dataType) => !dataType.schema?.safeParse(value).error),
        ['weight'],
        ['desc'],
    );

type CheckDataType = {
    value: string;
    dataType: string; // Change string to a more specific type if applicable
};

export const checkDataTypeIsInValid = ({ value, dataType }: CheckDataType) => !!getConfigByType(dataType).schema?.safeParse(value).error;

export const LITERAL_DATA_TYPES_CLASS_IDS = DATA_TYPES.filter((dt) => dt._class === ENTITIES.LITERAL).map((t) => t.classId);

export default DATA_TYPES;
