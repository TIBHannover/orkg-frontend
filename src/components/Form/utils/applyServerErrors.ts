import { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

import { parseProblemDetails, pointerToFieldPath } from '@/services/backend/problemDetails';

type ApplyServerErrorsOptions<T extends FieldValues> = {
    setError: UseFormSetError<T>;
    /**
     * Maps a backend field path (derived from the error `pointer`) to a form field,
     * for the cases where the names differ — e.g. `{ url: 'homepage' }`.
     */
    fieldMap?: Partial<Record<string, FieldPath<T>>>;
    /**
     * Form field paths that exist on the form (e.g. `Object.keys(schema.shape)`).
     * Field errors that don't resolve to one of these fall back to the form-level alert.
     * When omitted, every field error is attached inline.
     */
    knownFields?: readonly string[];
};

/**
 * Map an RFC 9457 problem response onto a react-hook-form.
 *
 * Field errors whose `pointer` resolves to a known form field are attached inline
 * via `setError` (and rendered by the `Controlled*` components). Anything that can't
 * be resolved to a field — unmapped field errors and the top-level `detail`/`title` —
 * is collected into a single `root.server` error, which `FormRootError` renders as a
 * form-level alert.
 *
 * Returns `true` when a problem response was handled, `false` otherwise (the caller
 * should then show its own generic fallback, e.g. a toast).
 */
const applyServerErrorsToForm = async <T extends FieldValues>(
    error: unknown,
    { setError, fieldMap, knownFields }: ApplyServerErrorsOptions<T>,
): Promise<boolean> => {
    const problem = await parseProblemDetails(error);
    if (!problem) {
        return false;
    }

    const rootMessages: string[] = [];

    // Resolve a backend field token to a form field: apply `fieldMap`, then keep it only if it's a
    // known form field (when `knownFields` is given). Returns undefined when it can't be resolved.
    const resolveField = (candidate: string): FieldPath<T> | undefined => {
        if (!candidate) {
            return undefined;
        }
        const mapped = fieldMap?.[candidate] ?? candidate;
        return !knownFields || knownFields.includes(mapped) ? (mapped as FieldPath<T>) : undefined;
    };

    problem.errors.forEach((fieldError) => {
        const path = pointerToFieldPath(fieldError.pointer);
        // Backend pointers can be wrapped (e.g. `/properties/url` for multipart updates), so fall
        // back to the last pointer segment (the actual field name) when the full path doesn't resolve.
        const lastSegment = path.includes('.') ? path.slice(path.lastIndexOf('.') + 1) : path;
        const target = resolveField(path) ?? resolveField(lastSegment);
        const message = fieldError.detail || problem.title || 'Invalid value';
        if (target) {
            setError(target, { type: 'server', message });
        } else if (fieldError.detail) {
            rootMessages.push(fieldError.detail);
        }
    });

    // For non-field problems (no `errors[]`), surface the occurrence-level message instead.
    if (problem.errors.length === 0) {
        const message = problem.detail ?? problem.title;
        if (message) {
            rootMessages.push(message);
        }
    }

    if (rootMessages.length > 0) {
        // `root.server` is not part of the schema, so it persists until the next submit.
        setError('root.server', { type: 'server', message: rootMessages.join(' ') });
    }

    return true;
};

export default applyServerErrorsToForm;
