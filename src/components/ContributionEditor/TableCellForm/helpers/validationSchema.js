import { z } from 'zod';
import { CLASSES } from 'constants/graphSettings';
import { preprocessNumber, preprocessBoolean } from 'constants/DataTypes';

export default function validationSchema(propertyShape) {
    let schema;
    if (propertyShape.datatype) {
        switch (propertyShape.datatype.id) {
            case CLASSES.DATE:
                schema = z.string().date();
                break;
            case CLASSES.DECIMAL:
                schema = z.preprocess(preprocessNumber, z.number());
                break;
            case CLASSES.STRING:
                schema = z.string();
                break;
            case CLASSES.INTEGER:
                schema = z.preprocess(preprocessNumber, z.number().int()).refine(
                    (value) => !Number.isNaN(value), // Reject NaN values
                    { message: 'Invalid input: must be a valid integer' },
                );
                break;
            case CLASSES.BOOLEAN:
                schema = z.preprocess(preprocessBoolean, z.boolean());
                break;
            case CLASSES.URI:
                schema = z.string().url();
                break;
            default:
                break;
        }
        if (propertyShape.min_inclusive) {
            schema = schema.min(parseFloat(propertyShape.min_inclusive));
        }
        if (propertyShape.max_inclusive) {
            schema = schema.max(parseFloat(propertyShape.max_inclusive));
        }
        if (propertyShape.pattern) {
            schema = schema.regex(new RegExp(propertyShape.pattern));
        }
    }
    return schema?.describe(propertyShape.path.label);
}
