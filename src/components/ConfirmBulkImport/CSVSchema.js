import Joi from '@hapi/joi';
import REGEX from 'constants/regex';
import moment from 'moment';

export default function checkDataValidation(data) {
    const header = data && data[0];
    const values = data && data.slice(1);
    const schema = Joi.array();

    // Check if paper:title column exists
    const columns = Joi.array()
        .has(
            Joi.string()
                .valid('paper:title')
                .required()
        )
        .message('Missing required column <em>paper:title</em>');
    // Title schema
    const titleSchema = Joi.array()
        .items(
            Joi.string()
                .required()
                .messages({
                    'string.empty': `Paper #{#key+1} : title is not allowed to be empty.`
                })
        )
        .messages({
            'array.includesRequiredUnknowns': `the file should at least contain one paper.`
        });
    // Publication month schema
    const monthSchema = Joi.array().items(
        Joi.number()
            .integer()
            .max(12)
            .min(1)
            .allow('')
            .messages({
                'number.max': `Paper #{#key+1} : publication month must be less than or equal to 12`,
                'number.min': `Paper #{#key+1} : publication month must be larger than or equal to 1`,
                'number.base': `Paper #{#key+1} : publication month must be a number`
            })
    );
    // Publication year schema
    const yearSchema = Joi.array().items(
        Joi.number()
            .integer()
            .max(moment().year())
            .min(1900)
            .allow('')
            .messages({
                'number.max': `Paper #{#key+1} : publication year must be less than or equal to ${moment().year()}`,
                'number.min': `Paper #{#key+1} : publication year must be larger than or equal to 1900`,
                'number.base': `Paper #{#key+1} : publication year must be a number`
            })
    );
    // Research field schema
    const researchFieldSchema = Joi.array().items(
        Joi.string()
            .pattern(new RegExp('^R((1[2-9]|[2-9][0-9]|[1-3][0-9]{2}|4[0-6][0-9]|47[0-3]))$')) // resource id between 11 and 473
            .allow('')
            .messages({
                'string.base': `Paper #{#key+1} : research field ID should be a type of 'text'`,
                'string.pattern.base': `Paper #{#key+1} : doesn't have a valid research field ID`
            })
    );
    // DOI
    const doiSchema = Joi.array().items(
        Joi.string()
            .pattern(new RegExp(REGEX.DOI))
            .allow('')
            .messages({
                'string.pattern.base': `Paper #{#key+1} : Doi must be a valid and without the resolver (e.g. 10.1145/3360901.3364435)`
            })
    );
    // URL
    const urlSchema = Joi.array().items(
        Joi.string()
            .pattern(new RegExp(REGEX.URL))
            .allow('')
            .messages({
                'string.pattern.base': `Paper #{#key+1} : URL must be a valid`
            })
    );
    // List of validations
    const validations = [{ context: 'Data', ...schema.validate(data) }, { context: 'Header', ...columns.validate(header, { context: 'Header' }) }];
    // validate paper title
    if (header && header.includes('paper:title')) {
        const TitleIndex = header.indexOf('paper:title');
        validations.push({ context: 'Title', ...titleSchema.validate(values.map(v => v[TitleIndex])) });
    }
    // validate publication month
    if (header && header.includes('paper:publication_month')) {
        const publicationMonthIndex = header.indexOf('paper:publication_month');
        validations.push({ context: 'Publication month', ...monthSchema.validate(values.map(v => v[publicationMonthIndex])) });
    }
    // validate publication month
    if (header && header.includes('paper:publication_year')) {
        const publicationYearIndex = header.indexOf('paper:publication_year');
        validations.push({ context: 'Publication year', ...yearSchema.validate(values.map(v => v[publicationYearIndex])) });
    }
    // validate research fields
    if (header && header.includes('paper:research_field')) {
        const ResearchFieldIndex = header.indexOf('paper:research_field');
        validations.push({ context: 'Research field', ...researchFieldSchema.validate(values.map(v => v[ResearchFieldIndex])) });
    }
    // validate DOI
    if (header && header.includes('paper:doi')) {
        const DoiIndex = header.indexOf('paper:doi');
        validations.push({ context: 'Doi', ...doiSchema.validate(values.map(v => v[DoiIndex])) });
    }
    // validate DOI
    if (header && header.includes('paper:url')) {
        const UrlIndex = header.indexOf('paper:url');
        validations.push({ context: 'URL', ...urlSchema.validate(values.map(v => v[UrlIndex])) });
    }
    return validations;
}
