import Joi from 'joi';
import { MISC, ENTITIES, CLASSES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import { orderBy } from 'lodash';
// https://www.w3.org/TR/xmlschema-2

const DATA_TYPES = [
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
        schema: Joi.string(),
        inputFormType: 'autocomplete',
        weight: 0,
    },
    {
        name: 'Text',
        tooltip: 'Choose Text for values like plain text or mathematical expressions using TeX delimiters $$...$$',
        type: MISC.DEFAULT_LITERAL_DATATYPE,
        _class: ENTITIES.LITERAL,
        classId: CLASSES.STRING,
        schema: Joi.string(),
        inputFormType: 'textarea',
        weight: 0,
    },
    {
        name: 'Decimal',
        type: 'xsd:decimal',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DECIMAL,
        schema: Joi.number().unsafe(),
        inputFormType: 'text',
        weight: 2,
    },
    {
        name: 'Integer',
        type: 'xsd:integer',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.INTEGER,
        schema: Joi.number().integer().unsafe(),
        inputFormType: 'text',
        weight: 3,
    },
    {
        name: 'Boolean',
        tooltip: 'Choose Boolean for "true" or "false" value',
        type: 'xsd:boolean',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.BOOLEAN,
        schema: Joi.boolean(),
        inputFormType: 'boolean',
        weight: 1,
    },
    {
        name: 'Date',
        type: 'xsd:date',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.DATE,
        schema: Joi.date().iso(),
        inputFormType: 'date',
        weight: 1,
    },
    {
        name: 'URL',
        type: 'xsd:anyURI',
        _class: ENTITIES.LITERAL,
        classId: CLASSES.URI,
        schema: Joi.string().regex(REGEX.URL).message('"value" must be a valid URL'),
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
        schema: Joi.string(),
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
    schema: Joi.string(),
    inputFormType: 'autocomplete',
    weight: 0
},
{
    name: 'Property',
    type: ENTITIES.PREDICATE,
    _class: ENTITIES.PREDICATE,
    classId: CLASSES.PREDICATE,
    schema: Joi.string(),
    inputFormType: 'autocomplete',
    weight: 0
} */

export const getConfigByType = type =>
    DATA_TYPES.find(dt => dt.type === type) || { type: MISC.DEFAULT_LITERAL_DATATYPE, validation: Joi.string(), inputFormType: 'textarea' };

export const getConfigByClassId = classId =>
    DATA_TYPES.find(dt => dt.classId === classId) || {
        name: 'Resource',
        type: ENTITIES.RESOURCE,
        _class: ENTITIES.RESOURCE,
        classId,
        schema: Joi.string(),
        inputFormType: 'autocomplete',
        weight: 0,
    };

export const getSuggestionByTypeAndValue = (type, value) => {
    const suggestions = DATA_TYPES.filter(dt => dt.type !== type)
        .filter(dt => {
            let error;
            if (dt.schema) {
                error = dt.schema.validate(value).error;
            }
            return !error;
        })
        .filter(dt => getConfigByType(type).weight < dt.weight);

    return orderBy(suggestions, ['weight'], ['desc']);
};

export const getSuggestionByValue = value =>
    orderBy(
        DATA_TYPES.filter(dataType => dataType.type !== ENTITIES.RESOURCE).filter(dataType => !dataType.schema?.validate(value)?.error),
        ['weight'],
        ['desc'],
    );

export const checkDataTypeIsInValid = ({ value, dataType }) => !!getConfigByType(dataType).schema.validate(value)?.error;

export default DATA_TYPES;
