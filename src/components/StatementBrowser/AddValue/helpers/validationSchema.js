import Joi from '@hapi/joi';

export default function validationSchema(predicate) {
    console.log(predicate.validationRules);
    let schema;
    if (predicate.templateClass) {
        switch (predicate.templateClass.id) {
            case 'Date':
                schema = Joi.date();
                break;
            case 'Number':
                schema = Joi.number();
                break;
            case 'String':
                schema = Joi.string();
                break;
            default:
                break;
        }
        for (const key in predicate.validationRules) {
            if (predicate.validationRules.hasOwnProperty(key)) {
                switch (key) {
                    case 'min':
                        console.log(predicate.validationRules[key]);
                        schema = schema.min(parseFloat(predicate.validationRules[key]));
                        break;
                    case 'max':
                        console.log(predicate.validationRules[key]);
                        schema = schema.max(parseFloat(predicate.validationRules[key]));
                        break;
                    case 'pattern':
                        console.log(predicate.validationRules[key]);
                        console.log(schema);
                        schema = schema.regex(new RegExp(predicate.validationRules[key]));
                        break;
                    default:
                        break;
                }
            }
        }
    }
    return schema.label(predicate.label);
}
