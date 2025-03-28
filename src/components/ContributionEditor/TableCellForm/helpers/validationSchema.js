import { z } from 'zod';

import { convertPropertyShapeToSchema } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { preprocessBoolean, preprocessNumber } from '@/constants/DataTypes';
import { CLASSES } from '@/constants/graphSettings';

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
                schema = z
                    .preprocess(preprocessNumber, z.number().int())
                    .refine((value) => !Number.isNaN(value), { message: 'Invalid input: must be a valid integer' });
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
        // Combine the datatype schema with any additional property shape validations
        const propertyShapeSchema = convertPropertyShapeToSchema(propertyShape);
        schema = schema && propertyShapeSchema ? schema.and(propertyShapeSchema) : schema || propertyShapeSchema;
    }
    return schema?.describe(propertyShape.path.label);
}
