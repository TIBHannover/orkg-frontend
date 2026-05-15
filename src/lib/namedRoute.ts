import { compile, type ParamData } from 'path-to-regexp';

function toParamData(params: Record<string, unknown>): ParamData {
    const out: ParamData = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            out[key] = value.map((v) => String(v));
        } else {
            out[key] = String(value);
        }
    }
    return out;
}

/**
 * Build a path from a path-to-regexp pattern and params (same behavior as named-urls `reverse`).
 * On compile failure, returns the original pattern string.
 */
export function reverse(pattern: string, params: Record<string, unknown> = {}): string {
    try {
        return compile(pattern)(toParamData(params));
    } catch {
        return pattern;
    }
}
