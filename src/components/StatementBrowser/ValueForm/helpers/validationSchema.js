import Joi from 'joi';
import { CLASSES } from 'constants/graphSettings';

export default function validationSchema(component) {
    let schema;
    if (component.value) {
        switch (component.value.id) {
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
                schema = Joi.string().uri();
                break;
            default:
                break;
        }
        for (const key in component.validationRules) {
            if (component.validationRules.hasOwnProperty(key)) {
                switch (key) {
                    case 'min':
                        schema = schema.min(parseFloat(component.validationRules[key]));
                        break;
                    case 'max':
                        schema = schema.max(parseFloat(component.validationRules[key]));
                        break;
                    case 'pattern':
                        schema = schema.regex(new RegExp(component.validationRules[key]));
                        break;
                    default:
                        break;
                }
            }
        }
    }
    return schema.label(component.property.label);
}
