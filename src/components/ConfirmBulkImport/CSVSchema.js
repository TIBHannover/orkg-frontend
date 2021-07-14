import Joi from 'joi';
import REGEX from 'constants/regex';
import moment from 'moment';

export default function checkDataValidation(data) {
    const header = data && data[0];
    const values = data && data.slice(1).map(r => r.map(s => (s ? s.trim() : '')));

    // Check if paper:title column exists
    const columns = Joi.array()
        .has(
            Joi.string()
                .valid('paper:title')
                .required()
        )
        .message('Missing required column <em>paper:title</em>');

    const { error } = columns.validate(header);

    if (error) {
        return `${error.message}`;
    }

    if (values.length === 0) {
        return `The CSV file should contain at least one paper.`;
    }

    const papersObjects = values.map(value => ({
        title: header.indexOf('paper:title') ? value[header.indexOf('paper:title')] : '',
        publication_month: header.indexOf('paper:publication_month') ? value[header.indexOf('paper:publication_month')] : '',
        publication_year: header.indexOf('paper:publication_year') ? value[header.indexOf('paper:publication_year')] : '',
        research_field: header.indexOf('paper:research_field') ? value[header.indexOf('paper:research_field')] : '',
        doi: header.indexOf('paper:doi') ? value[header.indexOf('paper:doi')] : '',
        url: header.indexOf('paper:url') ? value[header.indexOf('paper:url')] : ''
    }));

    const paperSchema = Joi.object({
        title: Joi.when('doi', { is: Joi.valid(), then: Joi.optional(), otherwise: Joi.string().required() }).messages({
            'string.empty': `Title is not allowed to be empty.`
        }),
        publication_month: Joi.number()
            .integer()
            .max(12)
            .min(1)
            .allow('')
            .messages({
                'number.max': `Publication month must be less than or equal to 12`,
                'number.min': `Publication month must be larger than or equal to 1`,
                'number.base': `Publication month must be a number`
            }),
        publication_year: Joi.number()
            .integer()
            .max(moment().year())
            .min(1900)
            .allow('')
            .messages({
                'number.max': `Publication year must be less than or equal to ${moment().year()}`,
                'number.min': `Publication year must be larger than or equal to 1900`,
                'number.base': `Publication year must be a number`
            }),
        research_field: Joi.string()
            .pattern(new RegExp('^(orkg:)?R([0-9])+$'))
            .allow('')
            .messages({
                'string.base': `Research field ID should be a type of 'text'`,
                'string.pattern.base': `doesn't have a valid research field ID`
            }),
        doi: Joi.string()
            .pattern(new RegExp(REGEX.DOI))
            .allow('')
            .messages({
                'string.pattern.base': `Doi must be a valid and without the resolver (e.g. 10.1145/3360901.3364435)`
            }),
        url: Joi.string()
            .pattern(new RegExp(REGEX.URL))
            .allow('')
            .messages({
                'string.pattern.base': `URL must be a valid`
            })
    });

    for (let i = 0; i < papersObjects.length; i++) {
        const { error } = paperSchema.validate(papersObjects[i]);
        if (error) {
            return `<b>Paper #${i + 1}</b>: ${error.message}`;
        }
    }
    return null;
}
