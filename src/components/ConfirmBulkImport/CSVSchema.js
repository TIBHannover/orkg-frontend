import { preprocessNumber } from 'constants/DataTypes';
import { EXTRACTION_METHODS } from 'constants/misc';
import REGEX from 'constants/regex';
import { z } from 'zod';

export default function checkDataValidation(data) {
    const header = data && data[0];
    const values = data && data.slice(1).map((r) => r.map((s) => (s ? s.trim() : '')));

    // Check if paper:title or paper:doi column exists
    const columns = z.array(z.string()).refine((arr) => arr.includes('paper:title') || arr.includes('paper:doi'), {
        message: 'Missing required column <em>paper:title</em> or <em>paper:doi</em>',
    });

    const { error } = columns.safeParse(header);

    if (error) {
        return `${error.errors?.[0]?.message}`;
    }

    if (values.length === 0) {
        return 'The CSV file should contain at least one paper.';
    }

    const papersObjects = values.map((value) => ({
        title: header.indexOf('paper:title') !== -1 ? value[header.indexOf('paper:title')] : '',
        publication_month: header.indexOf('paper:publication_month') !== -1 ? value[header.indexOf('paper:publication_month')] : '',
        publication_year: header.indexOf('paper:publication_year') !== -1 ? value[header.indexOf('paper:publication_year')] : '',
        research_field: header.indexOf('paper:research_field') !== -1 ? value[header.indexOf('paper:research_field')] : '',
        doi: header.indexOf('paper:doi') !== -1 ? value[header.indexOf('paper:doi')] : '',
        url: header.indexOf('paper:url') !== -1 ? value[header.indexOf('paper:url')] : '',
        extraction_method:
            header.indexOf('contribution:extraction_method') !== -1
                ? value[header.indexOf('contribution:extraction_method')] !== ''
                    ? value[header.indexOf('contribution:extraction_method')].toUpperCase()
                    : EXTRACTION_METHODS.UNKNOWN
                : EXTRACTION_METHODS.UNKNOWN,
    }));
    const currentYear = new Date().getFullYear();
    const paperSchema = z
        .object({
            title: z.string().optional(),
            publication_month: z
                .preprocess(preprocessNumber, z.number().int().min(1).max(12))
                .refine((value) => typeof value === 'string' || value >= 1, {
                    message: 'Publication month must be larger than or equal to 1',
                })
                .refine((value) => typeof value === 'string' || value <= 12, {
                    message: 'Publication month must be less than or equal to 12',
                })
                .or(z.literal('')),
            publication_year: z
                .preprocess(preprocessNumber, z.number().int().min(1900).max(currentYear))
                .refine((value) => typeof value === 'string' || value >= 1900, {
                    message: 'Publication year must be larger than or equal to 1900',
                })
                .refine((value) => typeof value === 'string' || value <= currentYear, {
                    message: `Publication year must be less than or equal to ${currentYear}`,
                })
                .or(z.literal('')),
            research_field: z
                .string()
                .regex(/^(orkg:)?R([0-9])+$|^$/, {
                    message: "doesn't have a valid research field ID",
                })
                .optional(),
            doi: z
                .string()
                .regex(REGEX.DOI_ID, {
                    message: 'Doi must be valid and without the resolver (e.g. 10.1145/3360901.3364435)',
                })
                .optional()
                .or(z.literal('')),
            url: z.string().regex(REGEX.URL, { message: 'URL must be valid' }).optional().or(z.literal('')),
            extraction_method: z
                .enum([EXTRACTION_METHODS.UNKNOWN, EXTRACTION_METHODS.MANUAL, EXTRACTION_METHODS.AUTOMATIC])
                .optional()
                .refine((value) => value, {
                    message:
                        'The extraction method can be empty, or if a value is given, it must be one of the following: UNKNOWN, MANUAL, AUTOMATIC.',
                }),
        })
        .superRefine((_data, ctx) => {
            if (!_data.title && !_data.doi) {
                ctx.addIssue({
                    path: ['title'], // You can associate the error with the `title` field
                    message: 'DOI or Title is a required column.',
                });
            }
        });
    for (let i = 0; i < papersObjects.length; i++) {
        const { error: _error } = paperSchema.safeParse(papersObjects[i]);
        if (_error) {
            const formattedErrors = _error.errors.map((err) => {
                const path = err.path.join(' > '); // Path to the invalid field
                return `${path}: ${err.message}`;
            });
            return `<b>Paper #${i + 1}</b>: ${formattedErrors.join('<br />')}`;
        }
    }
    return null;
}
