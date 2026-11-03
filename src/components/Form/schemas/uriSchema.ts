import { z } from 'zod';

// A refine (rather than a union with `z.url()`) so a custom error message survives
// an invalid value instead of zod's generic "Invalid input".
const absoluteUri = z
    .string()
    .trim()
    .refine((value) => value === '' || z.url().safeParse(value).success, {
        error: 'Please enter a valid absolute URI, e.g. https://example.org/ontology#Term',
    });

/** Optional URI field: an empty string is allowed and means "not set". */
export const uriSchema = absoluteUri;

/** Required URI field: the value must be a non-empty absolute URI. */
export const requiredUriSchema = absoluteUri.min(1, 'Please enter a URI');
