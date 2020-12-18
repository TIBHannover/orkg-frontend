import Joi from '@hapi/joi';

export const validateCellMapping = (mapper, value) => {
    if (mapper === undefined) {
        return false;
    }

    if (mapper === 'String') {
        // strings are always true
        return true;
    }
    if (mapper === 'Number') {
        const validationSchema = Joi.object({
            value: Joi.number().required()
        });
        const res = resolver({ value: value }, validationSchema);
        if (res.values.value) {
            return true;
        } else {
            return res.errors;
        }
    }
    if (mapper === 'Date') {
        // if this validates to number return false;
        const numValidationSchema = Joi.object({
            value: Joi.number().required()
        });
        const numRes = resolver({ value: value }, numValidationSchema);
        if (numRes.values.value) {
            return { value: { message: 'Value must be a valid data (YYYY-MM-DD) ' } };
        } else {
            const validationSchema = Joi.object({
                value: Joi.date().required()
            });
            const res = resolver({ value: value }, validationSchema);
            if (res.values.value) {
                return true;
            } else {
                return res.errors;
            }
        }
    }

    return false;
};

const resolver = (data, validationSchema) => {
    const { error, value: values } = validationSchema.validate(data, {
        abortEarly: false
    });

    return {
        values: error ? {} : values,
        errors: error
            ? error.details.reduce((previous, currentError) => {
                  return {
                      ...previous,
                      [currentError.path[0]]: currentError
                  };
              }, {})
            : {}
    };
};
