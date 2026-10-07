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

/**
 * Canonical path for a route with an optional tab catch-all (`[[...activeTab]]`). The default tab renders
 * the same page as the bare route, so it collapses onto it; any other tab keeps its own path. Only the
 * first segment counts, so junk deep paths collapse too.
 */
export function canonicalTabPath(
    basePattern: string,
    tabsPattern: string,
    params: Record<string, unknown>,
    activeTab: string[] | undefined,
    defaultTab: string,
): string {
    const tab = activeTab?.[0];
    return tab && tab !== defaultTab ? reverse(tabsPattern, { ...params, activeTab: tab }) : reverse(basePattern, params);
}
