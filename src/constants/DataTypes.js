import Joi from 'joi';
import { MISC } from 'constants/graphSettings';
//https://www.w3.org/TR/xmlschema-2

const DATA_TYPES = [
    { name: 'String', type: MISC.DEFAULT_LITERAL_DATATYPE, schema: Joi.string(), inputFormType: 'textarea' },
    { name: 'Decimal', type: 'xsd:decimal', schema: Joi.number(), inputFormType: 'text' },
    { name: 'Integer', type: 'xsd:integer', schema: Joi.number().integer(), inputFormType: 'text' },
    { name: 'Boolean', type: 'xsd:boolean', schema: Joi.boolean(), inputFormType: 'boolean' },
    { name: 'Date', type: 'xsd:date', schema: Joi.date(), inputFormType: 'date' }
];

export const getConfigByType = type => {
    return DATA_TYPES.find(dt => dt.type === type) || { type: MISC.DEFAULT_LITERAL_DATATYPE, validation: Joi.string(), inputFormType: 'textarea' };
};
export default DATA_TYPES;
