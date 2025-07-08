import pluralize from 'pluralize';
import { z } from 'zod';

import { findTypeByIdOrName, MappedColumn, parseCellString } from '@/app/csv-import/steps/helpers';
import { getConfigByType, preprocessNumber } from '@/constants/DataTypes';
import { PREDICATES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import REGEX from '@/constants/regex';

export const validateCsvStructure = (data: string[][]) => {
    if (!data || data.length === 0) {
        return 'CSV file is empty or invalid.';
    }

    const header = data[0];
    if (!header || header.length === 0) {
        return 'CSV file must have a header row.';
    }

    // Check for rows with different number of fields from the header row
    const headerLength = header.length;
    const invalidRows: number[] = [];

    for (let i = 1; i < data.length; i += 1) {
        const row = data[i];
        if (!row || row.length !== headerLength) {
            invalidRows.push(i + 1); // +1 for 1-based indexing
        }
    }

    if (invalidRows.length > 0) {
        const rowCount = invalidRows.length;
        const hasText = rowCount === 1 ? 'has' : 'have';

        // Safe access to get the actual row length for single row errors
        let foundLength = 'varying counts';
        if (rowCount === 1) {
            const rowIndex = invalidRows[0] - 1; // Convert back to 0-based indexing
            const problemRow = data[rowIndex];
            if (problemRow) {
                foundLength = problemRow.length.toString();
            }
        }

        return (
            `${pluralize('Row', rowCount)} ${invalidRows.slice(0, 5).join(', ')}${
                rowCount > 5 ? ` and ${rowCount - 5} more` : ''
            } ${hasText} a different number of fields than the header row. Expected ${headerLength} ${pluralize(
                'field',
                headerLength,
            )}, but found ${foundLength}. ` +
            'Please fix your CSV file to ensure all rows have the same number of fields as the header before uploading.'
        );
    }

    return null;
};

export const validateColumns = (data: string[][]) => {
    const header = data && data[0];
    const values = data && data.slice(1).map((r) => r.map((s) => (s ? s.trim() : '')));

    // Check if headers have valid labels after parsing with parseCellString
    if (header) {
        for (let i = 0; i < header.length; i += 1) {
            const { label } = parseCellString(header[i]);
            if (!label || label.trim() === '') {
                return `Column ${i + 1} has an empty label. All columns must have a non-empty label.`;
            }
        }
    }

    // Check if paper:title or paper:doi column exists
    const columns = z.array(z.string()).refine((arr) => arr.includes('title') || arr.includes(PREDICATES.HAS_DOI), {
        message: 'Missing required column title or doi',
    });

    // Check for duplicate columns for all DEFAULT_HEADERS
    const defaultHeaderIds = [
        'title',
        PREDICATES.HAS_DOI,
        PREDICATES.URL,
        PREDICATES.HAS_AUTHORS,
        PREDICATES.HAS_PUBLICATION_MONTH,
        PREDICATES.HAS_PUBLICATION_YEAR,
        PREDICATES.HAS_VENUE,
        PREDICATES.HAS_RESEARCH_FIELD,
        'extraction_method',
    ];

    for (const headerId of defaultHeaderIds) {
        const count = header?.filter((col) => col === headerId).length || 0;
        if (count > 1) {
            return `Duplicate ${headerId} columns detected. Please ensure there is only one ${headerId} column.`;
        }
    }

    const { error } = columns.safeParse(header);
    if (error) {
        return error.errors[0].message;
    }

    if (values.length === 0) {
        return 'The CSV file should contain at least one paper.';
    }

    return null;
};

export const validateRequiredFields = (row: string[], columnTypes: (MappedColumn | null)[]): z.ZodError<any> | null => {
    // Find title and doi column indices
    const titleColumnIndex = columnTypes.findIndex((col) => col?.predicate?.id === 'title');
    const doiColumnIndex = columnTypes.findIndex((col) => col?.predicate?.id === PREDICATES.HAS_DOI);

    const titleValue = titleColumnIndex >= 0 ? (row[titleColumnIndex] || '').trim() : '';
    const doiValue = doiColumnIndex >= 0 ? (row[doiColumnIndex] || '').trim() : '';

    // Create a Zod schema for the required fields validation
    const requiredFieldsSchema = z
        .object({
            title: z.string(),
            doi: z.string(),
        })
        .refine((data) => data.title.trim() !== '' || data.doi.trim() !== '', {
            message: 'At least one of title or doi must have a value',
        });

    const result = requiredFieldsSchema.safeParse({ title: titleValue, doi: doiValue });
    return result.error ?? null;
};

export const validateValueOfCell = <T extends boolean = true>(
    data: string,
    column: MappedColumn | null,
    returnOnlyError: T = true as T,
): T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any> => {
    let cellSchema;
    const currentYear = new Date().getFullYear();

    const { label, hasTypeInfo, typeStr } = parseCellString(data);

    if (!column) {
        if (returnOnlyError) {
            return null as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>;
        }
        return { error: null, data, success: true } as unknown as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>;
    }

    switch (column.predicate?.id) {
        case 'title':
            cellSchema = z.string().optional();
            break;
        case PREDICATES.HAS_PUBLICATION_MONTH:
            cellSchema = z
                .preprocess(preprocessNumber, z.number().int().min(1).max(12))
                .refine((value) => typeof value === 'string' || value >= 1, {
                    message: 'Publication month must be larger than or equal to 1',
                })
                .refine((value) => typeof value === 'string' || value <= 12, {
                    message: 'Publication month must be less than or equal to 12',
                })
                .refine((value) => !Number.isNaN(value), { message: 'Invalid input: must be a valid number' })
                .optional();
            break;
        case PREDICATES.HAS_PUBLICATION_YEAR:
            cellSchema = z
                .preprocess(preprocessNumber, z.number().int().min(1900).max(currentYear))
                .refine((value) => typeof value === 'string' || value >= 1900, {
                    message: 'Publication year must be larger than or equal to 1900',
                })
                .refine((value) => typeof value === 'string' || value <= currentYear, {
                    message: `Publication year must be less than or equal to ${currentYear}`,
                })
                .refine((value) => !Number.isNaN(value), { message: 'Invalid input: must be a valid number' })
                .optional();
            break;
        case PREDICATES.HAS_RESEARCH_FIELD:
            cellSchema = z.string().regex(/^(orkg:)?R([0-9])+$/, {
                message: "doesn't have a valid research field ID",
            });
            break;
        case PREDICATES.HAS_DOI:
            cellSchema = z
                .string()
                .regex(REGEX.DOI_ID, { message: 'Doi must be valid and without the resolver (e.g. 10.1145/3360901.3364435)' })
                .optional()
                .or(z.literal(''));
            break;
        case PREDICATES.URL:
            cellSchema = z.string().regex(REGEX.URL, { message: 'URL must be valid' }).optional().or(z.literal(''));
            break;
        case 'extraction_method':
            cellSchema = z
                .enum([EXTRACTION_METHODS.UNKNOWN, EXTRACTION_METHODS.MANUAL, EXTRACTION_METHODS.AUTOMATIC])
                .optional()
                .refine((value) => value, {
                    message:
                        'The extraction method can be empty, or if a value is given, it must be one of the following: UNKNOWN, MANUAL, AUTOMATIC.',
                });
            break;
        default:
            break;
    }

    // If the value has a type, use the type specified in the cell
    if (hasTypeInfo && typeStr && !cellSchema) {
        const typeObj = findTypeByIdOrName(typeStr);
        if (typeObj) {
            cellSchema = typeObj.schema;
        }
    }
    if (!cellSchema && column.type?.type) {
        cellSchema = getConfigByType(column.type?.type).schema;
    }

    if (!cellSchema) {
        if (returnOnlyError) {
            return null as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>;
        }
        return { error: null, data, success: true } as unknown as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>;
    }

    // For required fields like research field, don't skip validation for empty strings
    const isRequiredField = column.predicate?.id === PREDICATES.HAS_RESEARCH_FIELD;
    if (data === '' && !isRequiredField) {
        return returnOnlyError
            ? (null as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>)
            : ({ error: null, data, success: true } as unknown as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>);
    }

    // If the value has a type, validate the parsed label against the type
    const result = cellSchema.safeParse(hasTypeInfo && typeStr ? label : data);
    if (returnOnlyError) {
        return (result?.error ?? null) as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>;
    }
    return result as T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any>;
};
