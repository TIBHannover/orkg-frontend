import Joi from 'joi';
import { CLASSES } from 'constants/graphSettings';
import REGEX from 'constants/regex';

export default function validationSchema(propertyShape) {
    let schema;
    if (propertyShape.value) {
        switch (propertyShape.value.id) {
            case CLASSES.DATE:
                schema = Joi.date().iso();
                break;
            case CLASSES.DECIMAL:
                schema = Joi.number();
                break;
            case CLASSES.STRING:
                schema = Joi.string();
                break;
            case CLASSES.INTEGER:
                schema = Joi.number().integer();
                break;
            case CLASSES.BOOLEAN:
                schema = Joi.boolean();
                break;
            case CLASSES.URI:
                schema = Joi.string().regex(REGEX.URL).message('"value" must be a valid URL');
                break;
            default:
                break;
        }
        if (propertyShape.minInclusive) {
            schema = schema.min(parseFloat(propertyShape.minInclusive));
        }
        if (propertyShape.maxInclusive) {
            schema = schema.max(parseFloat(propertyShape.maxInclusive));
        }
        if (propertyShape.pattern) {
            schema = schema.regex(new RegExp(propertyShape.pattern));
        }
    }
    return schema.label(propertyShape.property.label);
}
