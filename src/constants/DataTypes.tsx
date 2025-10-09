import { isUri } from '@hyperjump/uri';
import { orderBy } from 'lodash';
import { z, ZodType } from 'zod';

import { CLASSES, ENTITIES, MISC } from '@/constants/graphSettings';
import { EntityType } from '@/services/backend/types';
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

export type GregorianType = 'gYear' | 'gMonth' | 'gDay' | 'gYearMonth' | 'gMonthDay';

export type DurationType = 'duration' | 'yearMonthDuration' | 'dayTimeDuration';

export type DateTimeType = 'dateTime' | 'dateTimeStamp';

export type InputType = StandardInputType | 'autocomplete' | 'empty' | 'boolean' | DurationType | DateTimeType | GregorianType;

export type DataType = {
    name: string;
    tooltip?: string | React.ReactNode;
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
        if (!/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
            return NaN; // Return NaN for invalid inputs
        }
        return parseFloat(trimmed); // Coerce valid numeric strings
    }
    return value; // Pass non-strings as is
};

export const preprocessBigIntNumber = (value: unknown) => {
    if (typeof value === 'string') {
        // Check if the string is purely numeric
        const trimmed = value.trim();
        if (!/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
            return NaN; // Return NaN for invalid inputs
        }
        // Coerce valid numeric strings
        try {
            return BigInt(trimmed);
        } catch {
            return parseFloat(trimmed);
        }
    }
    return value; // Pass non-strings as is
};

export const preprocessBoolean = (value: unknown) => {
    if (typeof value === 'string') {
        const lowercaseValue = value.toLowerCase();
        if (lowercaseValue === 'true' || lowercaseValue === '1') return true;
        if (lowercaseValue === 'false' || lowercaseValue === '0') return false;
        return undefined; // Invalid case
    }
    return value; // Pass non-strings as is
};

// Backend types validation are defined here https://gitlab.com/TIBHannover/orkg/orkg-backend/-/blob/master/graph/graph-core-model/src/main/kotlin/org/orkg/graph/domain/Constants.kt
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
        schema: z.string().refine((value) => isUri(value), { message: 'Invalid url' }),
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
    {
        name: 'Duration',
        type: 'xsd:duration',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DURATION,
        schema: z.string().regex(/^-?P(?!$)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d+[HMS])(\d+H)?(\d+M)?(\d+S)?)?$/, {
            message: 'Invalid duration format. Expected format: PnYnMnDTnHnMnS',
        }),
        inputFormType: 'duration',
        weight: 1,
    },
    {
        name: 'Year month duration',
        type: 'xsd:yearMonthDuration',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.YEAR_MONTH_DURATION,
        schema: z.string().regex(/^P(\d+Y)?(\d+M)?$/, {
            message: 'Invalid yearMonthDuration format. Expected format: PnYnM',
        }),
        inputFormType: 'yearMonthDuration',
        weight: 1,
    },
    {
        name: 'Day time duration',
        type: 'xsd:dayTimeDuration',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DAY_TIME_DURATION,
        schema: z.string().regex(/^P(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/, {
            message: 'Invalid dayTimeDuration format. Expected format: PnDTnHnMnS',
        }),
        inputFormType: 'dayTimeDuration',
        weight: 1,
    },
    {
        name: 'Time',
        type: 'xsd:time',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.TIME,
        schema: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d{1,3})?$/, {
            message: 'Invalid time format. Expected format: hh:mm:ss[.sss]',
        }),
        inputFormType: 'time',
        weight: 1,
    },
    {
        name: 'Date time',
        type: 'xsd:dateTime',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DATE_TIME,
        schema: z.string().regex(
            // eslint-disable-next-line max-len
            /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(?:\.\d{1,3})?(?:Z|(?:[+-](?:[01][0-9]|2[0-3]):[0-5][0-9]))?$/,
            {
                message: 'Invalid dateTime format. Expected format: YYYY-MM-DDThh:mm:ss[.sss][Z|(+|-)hh:mm]',
            },
        ),
        inputFormType: 'dateTime',
        weight: 1,
    },
    {
        name: 'Date time stamp',
        type: 'xsd:dateTimeStamp',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DATE_TIME_STAMP,
        schema: z.string().regex(
            // eslint-disable-next-line max-len
            /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(?:\.\d{1,3})?(?:Z|(?:[+-](?:[01][0-9]|2[0-3]):[0-5][0-9]))$/,
            {
                message: 'Invalid dateTimeStamp format. Expected format: YYYY-MM-DDThh:mm:ss[.sss](Z|(+|-)hh:mm)',
            },
        ),
        inputFormType: 'dateTimeStamp',
        weight: 1,
    },
    {
        name: 'Gregorian year month',
        type: 'xsd:gYearMonth',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.G_YEAR_MONTH,
        schema: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
            message: 'Invalid gYearMonth format. Expected format: YYYY-MM',
        }),
        inputFormType: 'gYearMonth',
        weight: 1,
    },
    {
        name: 'Gregorian year',
        type: 'xsd:gYear',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.G_YEAR,
        schema: z.string().regex(/^\d{4}$/, {
            message: 'Invalid gYear format. Expected format: YYYY',
        }),
        inputFormType: 'gYear',
        weight: 3,
    },
    {
        name: 'Gregorian month day',
        type: 'xsd:gMonthDay',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.G_MONTH_DAY,
        schema: z.string().regex(/^--(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
            message: 'Invalid gMonthDay format. Expected format: --MM-DD',
        }),
        inputFormType: 'gMonthDay',
        weight: 1,
    },
    {
        name: 'Gregorian day',
        type: 'xsd:gDay',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.G_DAY,
        schema: z.string().regex(/^---(0[1-9]|[12][0-9]|3[01])$/, {
            message: 'Invalid gDay format. Expected format: ---DD',
        }),
        inputFormType: 'gDay',
        weight: 1,
    },
    {
        name: 'Gregorian month',
        type: 'xsd:gMonth',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.G_MONTH,
        schema: z.string().regex(/^--(0[1-9]|1[0-2])$/, {
            message: 'Invalid gMonth format. Expected format: --MM',
        }),
        inputFormType: 'gMonth',
        weight: 1,
    },
    {
        name: 'Class',
        type: ENTITIES.CLASS,
        _class: ENTITIES.CLASS,
        classId: CLASSES.CLASS,
        schema: z.string(),
        inputFormType: 'autocomplete',
        weight: 0,
    },
    {
        name: 'Property',
        type: ENTITIES.PREDICATE,
        _class: ENTITIES.PREDICATE,
        classId: CLASSES.PREDICATE,
        schema: z.string(),
        inputFormType: 'autocomplete',
        weight: 0,
    },
];

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
