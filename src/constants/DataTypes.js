import Joi from 'joi';
import { MISC, ENTITIES } from 'constants/graphSettings';
//https://www.w3.org/TR/xmlschema-2

const DATA_TYPES = [
    {
        name: 'Resource',
        tooltip: (
            <>
                Choose Resource to link this to a resource which can contain values on its own. <br /> To fetch an existing resource by ID type “#”
                without quotes following with the resource ID (e.g: #R12).
            </>
        ),
        type: 'object',
        _class: 'object',
        schema: Joi.string(),
        inputFormType: 'autocomplete'
    },
    {
        name: 'Text',
        tooltip: 'Choose Text for values like plain text or mathematical expressions using TeX delimiters $$...$$',
        type: MISC.DEFAULT_LITERAL_DATATYPE,
        _class: ENTITIES.LITERAL,
        schema: Joi.string(),
        inputFormType: 'textarea'
    },
    { name: 'Decimal', type: 'xsd:decimal', _class: ENTITIES.LITERAL, schema: Joi.number(), inputFormType: 'text' },
    { name: 'Integer', type: 'xsd:integer', _class: ENTITIES.LITERAL, schema: Joi.number().integer(), inputFormType: 'text' },
    {
        name: 'Boolean',
        tooltip: 'Choose Boolean for "true" or "false" value',
        type: 'xsd:boolean',
        _class: ENTITIES.LITERAL,
        schema: Joi.boolean(),
        inputFormType: 'boolean'
    },
    { name: 'Date', type: 'xsd:date', _class: ENTITIES.LITERAL, schema: Joi.date(), inputFormType: 'date' }
];

export const getConfigByType = type => {
    return DATA_TYPES.find(dt => dt.type === type) || { type: MISC.DEFAULT_LITERAL_DATATYPE, validation: Joi.string(), inputFormType: 'textarea' };
};
export default DATA_TYPES;
