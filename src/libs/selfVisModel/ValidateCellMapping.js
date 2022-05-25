import Joi from 'joi';

export const validateCellMapping = (mapper, cellValue) => {
    if (mapper === undefined) {
        return { error: null, value: cellValue };
    }

    if (mapper === 'String') {
        // strings are always true
        return { error: null, value: cellValue };
    }
    if (mapper === 'Number') {
        const validationSchema = Joi.number().required();
        return validationSchema.validate(cellValue);
    }
    if (mapper === 'Date') {
        // if this validates to number return false;
        const numValidationSchema = Joi.number().required();
        const { error } = numValidationSchema.validate(cellValue);
        if (!error) {
            return { error: { message: 'Value must be a valid data (YYYY-MM-DD) ' }, value: cellValue };
        }
        const validationSchema = Joi.date().required();
        return validationSchema.validate(cellValue);
    }

    return { error: null, value: cellValue };
};
