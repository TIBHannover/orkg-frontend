/**
 * Parse preference cookies set as string booleans via next-client-cookies `set(..., String(bool))`.
 */
export const parseBooleanPreferenceCookie = (raw: string | undefined): boolean | undefined => {
    if (raw === undefined) {
        return undefined;
    }
    if (raw === 'true') {
        return true;
    }
    if (raw === 'false') {
        return false;
    }
    return undefined;
};

/**
 * Whether the cookie consent banner was dismissed. Accepts legacy values from react-cookie /
 * universal-cookie (e.g. JSON-serialized booleans) and plain string "true".
 */
export const isCookieInfoDismissed = (raw: string | undefined): boolean => {
    if (raw == null || raw === '') {
        return false;
    }
    const t = raw.trim().toLowerCase();
    if (t === 'true' || t === '1') {
        return true;
    }
    if (t === 'false' || t === '0') {
        return false;
    }
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed === true) {
            return true;
        }
        if (parsed === false) {
            return false;
        }
    } catch {
        // not JSON
    }
    return false;
};
