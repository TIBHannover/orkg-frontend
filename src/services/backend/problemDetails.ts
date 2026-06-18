import { ResponseError } from '@orkg/orkg-client';

/**
 * Normalized representation of an RFC 9457 (Problem Details for HTTP APIs) error
 * response. The ORKG backend (>= 0.87.0) returns problem+json bodies; the legacy
 * Spring-style fields (`error`, `path`, `timestamp`, `errors[].field/message`) are
 * still present but deprecated. This module is the single place that reads the new
 * fields with a fallback to the deprecated ones, so the rest of the app never has
 * to care about the transition.
 *
 * See https://datatracker.ietf.org/doc/html/rfc9457 and the backend models
 * (`InvalidLabel`, `CannotResetURIErrorsInner`) in `@orkg/orkg-client`.
 */

export type ProblemFieldError = {
    /** JSON Pointer to the offending request field, e.g. `/name` (falls back to the deprecated `field`). */
    pointer: string;
    /** Human-readable description of the field problem (falls back to the deprecated `message`). */
    detail: string;
};

export type ProblemDetails = {
    /** URI identifying the problem type, e.g. `orkg:problem:invalid_label`. */
    type?: string;
    /** Short, human-readable summary of the problem (falls back to the deprecated `error`). */
    title?: string;
    /** HTTP status code. */
    status?: number;
    /** Human-readable explanation specific to this occurrence (falls back to the deprecated `message`). */
    detail?: string;
    /** URI identifying the specific occurrence (falls back to the deprecated `path`). */
    instance?: string;
    /** Field-level validation errors. */
    errors: ProblemFieldError[];
};

type RawFieldError = {
    pointer?: string;
    field?: string;
    detail?: string;
    message?: string;
};

type RawProblem = {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    error?: string;
    path?: string;
    timestamp?: string;
    message?: string;
    errors?: RawFieldError[];
};

// Keys that mark an object as a problem body. `message` is intentionally excluded so a
// plain `Error` (which always has `message`) is not mistaken for a backend problem body.
const PROBLEM_KEYS: (keyof RawProblem)[] = ['type', 'title', 'status', 'detail', 'instance', 'errors', 'error', 'path', 'timestamp'];

/**
 * Convert an RFC 6901 JSON Pointer (e.g. `/items/0/name`) into a react-hook-form
 * dotted field path (e.g. `items.0.name`).
 */
export const pointerToFieldPath = (pointer: string): string => {
    if (!pointer) {
        return '';
    }
    return pointer
        .replace(/^\//, '')
        .split('/')
        .map((token) => token.replace(/~1/g, '/').replace(/~0/g, '~'))
        .join('.');
};

/**
 * Normalize an already-parsed response body into {@link ProblemDetails}, reading the
 * RFC 9457 fields with a fallback to the deprecated ones. Returns `null` when the body
 * does not look like a problem response.
 */
export const normalizeProblemDetails = (body: unknown): ProblemDetails | null => {
    if (!body || typeof body !== 'object') {
        return null;
    }
    const raw = body as RawProblem;
    if (!PROBLEM_KEYS.some((key) => key in raw)) {
        return null;
    }

    // TODO(remove): temporary guard — coerce string-typed fields to strings so a non-string value
    // can never leak into the (string-typed) result. Needed today because `ky`'s GET error hook
    // (`backendApi.beforeError`) returns `{ error: new Error(...) }`, putting an Error object under
    // `error`. Drop this once GET errors are parsed into a real problem body and the deprecated
    // fields (`error`/`path`/`message`) are gone — then plain `??` is enough.
    const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

    const errors: ProblemFieldError[] = Array.isArray(raw.errors)
        ? raw.errors
              .map((fieldError) => ({
                  pointer: asString(fieldError?.pointer) ?? (asString(fieldError?.field) ? `/${fieldError.field}` : ''),
                  detail: asString(fieldError?.detail) ?? asString(fieldError?.message) ?? '',
              }))
              .filter((fieldError) => fieldError.pointer || fieldError.detail)
        : [];

    return {
        type: asString(raw.type),
        title: asString(raw.title) ?? asString(raw.error),
        status: typeof raw.status === 'number' ? raw.status : undefined,
        detail: asString(raw.detail) ?? asString(raw.message),
        instance: asString(raw.instance) ?? asString(raw.path),
        errors,
    };
};

const isResponse = (value: unknown): value is Response => typeof Response !== 'undefined' && value instanceof Response;

const readResponseBody = async (response: Response): Promise<unknown> => {
    try {
        // clone so callers/other consumers can still read the body
        return await response.clone().json();
    } catch {
        return null;
    }
};

/**
 * Parse a thrown value from any of the app's HTTP transports into {@link ProblemDetails}:
 * - `@orkg/orkg-client` throws a `ResponseError` carrying an unread `Response`.
 * - `ky` GET errors (and other `HTTPError`s) carry a `Response` on `.response`.
 * - `ky` non-GET errors are already the parsed problem body (see `backendApi.beforeError`).
 *
 * Returns `null` for anything that is not a backend problem response (e.g. a network error),
 * so callers can fall back to their own generic message.
 */
export const parseProblemDetails = async (error: unknown): Promise<ProblemDetails | null> => {
    if (!error) {
        return null;
    }
    if (error instanceof ResponseError) {
        return normalizeProblemDetails(await readResponseBody(error.response));
    }
    if (typeof error === 'object' && 'response' in error && isResponse((error as { response: unknown }).response)) {
        return normalizeProblemDetails(await readResponseBody((error as { response: Response }).response));
    }
    return normalizeProblemDetails(error);
};
