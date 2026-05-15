/**
 * Browser-safe stub for `jsonwebtoken`, used only in Storybook.
 *
 * The real package depends on Node built-ins (`util.inherits`, `crypto`, …)
 * via its `jws` dependency, which Vite cannot bundle for the browser.
 * `src/services/keycloak/index.ts` only calls `jwt.decode(token)` — this
 * shim covers that one path with a minimal, no-verification base64 decode.
 */

const base64UrlDecode = (segment: string): string => {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    return atob(padded + padding);
};

export const decode = (token: unknown): unknown => {
    if (typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
        const payload = base64UrlDecode(parts[1]);
        return JSON.parse(decodeURIComponent(escape(payload)));
    } catch {
        return null;
    }
};

const stub = {
    decode,
    sign: () => {
        throw new Error('jsonwebtoken.sign is not available in Storybook (browser stub).');
    },
    verify: () => {
        throw new Error('jsonwebtoken.verify is not available in Storybook (browser stub).');
    },
};

export default stub;
