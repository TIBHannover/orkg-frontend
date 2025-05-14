import { z } from 'zod';

import { findTypeByIdOrName, MappedColumn, parseCellString } from '@/app/csv-import/steps/helpers';
import { getConfigByType, preprocessNumber } from '@/constants/DataTypes';
import { PREDICATES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import REGEX from '@/constants/regex';

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

export const validateValueOfCell = <T extends boolean = true>(
    data: string,
    column: MappedColumn | null,
    returnOnlyError: T = true as T,
): T extends true ? z.ZodError<any> | null : z.SafeParseReturnType<any, any> => {
    let cellSchema;
    const currentYear = new Date().getFullYear();

    const { label, hasTypeInfo, typeStr } = parseCellString(data);

    if (!column) return returnOnlyError ? null : ({ error: null, data, success: true } as any);

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
            cellSchema = z
                .string()
                .regex(/^(orkg:)?R([0-9])+$|^$/, {
                    message: "doesn't have a valid research field ID",
                })
                .optional();
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

    if (!cellSchema) return returnOnlyError ? null : ({ error: null, data, success: true } as any);

    if (data === '') return returnOnlyError ? null : ({ error: null, data, success: true } as any);

    // If the value has a type, validate the parsed label against the type
    const result = cellSchema.safeParse(hasTypeInfo && typeStr ? label : data);
    return returnOnlyError ? result?.error ?? null : (result as any);
};
