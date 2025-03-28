import { z } from 'zod';

import { preprocessNumber } from '@/constants/DataTypes';

export const validateCellMapping = (mapper, cellValue) => {
    if (mapper === undefined) {
        return { error: null, value: cellValue };
    }

    if (mapper === 'String') {
        // strings are always true
        return { error: null, value: cellValue };
    }
    if (mapper === 'Number') {
        const validationSchema = z.preprocess(preprocessNumber, z.number());
        return validationSchema.safeParse(cellValue);
    }
    if (mapper === 'Date') {
        // if this validates to number return false;
        const numValidationSchema = z.preprocess(preprocessNumber, z.number());
        const { error } = numValidationSchema.safeParse(cellValue);
        if (!error) {
            return { error: { message: 'Value must be a valid data (YYYY-MM-DD) ' }, value: cellValue };
        }
        const validationSchema = z.string().date();
        return validationSchema.safeParse(cellValue);
    }

    return { error: null, value: cellValue };
};

export default validateCellMapping;
