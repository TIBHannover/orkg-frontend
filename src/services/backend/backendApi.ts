import { Configuration } from '@orkg/orkg-client';
import ky from 'ky';
import { getSession, signOut } from 'next-auth/react';
import { env } from 'next-runtime-env';

import { SortByParam } from '@/services/backend/types';

let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;
let pendingTokenPromise: Promise<string | null> | null = null;

export const getAccessToken = async (): Promise<string | null> => {
    const EXPIRY_BUFFER_TIME = 60 * 1000; // 60 seconds
    // Use cached token if it is still considered valid (with buffer)
    if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
        return cachedToken;
    }
    // Deduplicate concurrent token requests
    if (pendingTokenPromise) {
        return pendingTokenPromise;
    }
    pendingTokenPromise = (async () => {
        const session = await getSession();
        if (session?.error === 'RefreshTokenError') {
            await signOut();
            return null;
        }
        const token = session?.access_token ?? null;
        const expiresAtMs = session?.expires_at ? session.expires_at * 1000 : null; // Convert to milliseconds

        // Always return the latest token from the session if present.
        // We still maintain a buffer for the cached validity window, but we do not drop the header when close to expiry.
        if (token) {
            cachedToken = token;
            tokenExpiryTime = expiresAtMs ? expiresAtMs - EXPIRY_BUFFER_TIME : null;
            return token;
        }

        return null;
    })().finally(() => {
        pendingTokenPromise = null;
    });
    return pendingTokenPromise;
};

export const configuration = new Configuration({
    basePath: env('NEXT_PUBLIC_BACKEND_URL')?.replace(/\/$/, ''), // remove the trailing slash, can be removed when the .env file is updated to remove the trailing slash
    fetchApi: async (input: RequestInfo, init?: RequestInit) => {
        const token = await getAccessToken();
        const headers = new Headers(init?.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        // No `next.revalidate`/`cache` option: it would put every server-component call through the
        // generated client into Next's data cache, so an edit (e.g. a comparison title) keeps
        // rendering stale for the whole window after a reload. The ky client below never set one
        // either; Next's default (`auto no cache`) re-fetches on every request.
        return fetch(input, { ...init, headers, credentials: 'omit' });
    },
});

const backendApi = ky.create({
    timeout: 1000 * 60 * 10, // 10 minutes
    credentials: 'omit', // prevent cookies from being sent to the backend (we handle auth manually via the header)
    hooks: {
        beforeRequest: [
            async (request) => {
                const token = await getAccessToken();
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
        ],
        beforeError: [
            (error) => {
                const { response, request } = error;

                // legacy feature where response error JSON wasn't parsed for GET request
                // should be refactored in the future to also parse JSON GET request errors
                if (request.method !== 'GET') {
                    try {
                        return error.response.json();
                    } catch (e) {
                        console.error(e);
                    }
                }
                return {
                    ...error,
                    error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                    statusCode: response.status,
                    statusText: response.statusText,
                };
            },
        ],
    },
});

export default backendApi;

export const getCreatedIdFromHeaders = (headers: Headers) =>
    headers.get('Location')?.substring((headers.get('Location')?.lastIndexOf('/') || 0) + 1) || '';

export const getCreatedId = ({ raw }: { raw: Response }) =>
    raw.headers.get('Location')?.substring((raw.headers.get('Location')?.lastIndexOf('/') || 0) + 1) || '';

// media-type parameter that makes resource labels come back pre-rendered from their templates'
// formatted_label patterns; passed as the generated operations' `accept` request parameter
export const FORMATTED_LABELS_ACCEPT = 'application/json;formatted-labels=V1';

// the wire sort convention is snake_case: most endpoints reject camelCase keys with a 400
// "Unknown sorting property" (verified on resources/papers/statements/templates/rosetta-stone;
// only the newer snapshots endpoint resolves camelCase, and it opts out of this transform).
// The statistics endpoints' projection keys (total_count, paper_count, ...) are already snake
// and pass through untouched. Code and URLs use camelCase; this map is the single translation
// point, guarded with Object.hasOwn because the property can come from the URL.
const SORT_PROPERTY_ALIASES: Record<string, string> = {
    createdAt: 'created_at',
    createdBy: 'created_by',
};

/** Alias one `property,direction` token. Applied to both `sortBy` and a pre-formatted `sort`. */
const aliasSortToken = (token: string) => {
    const [property, ...rest] = token.split(',');
    const aliased = Object.hasOwn(SORT_PROPERTY_ALIASES, property) ? SORT_PROPERTY_ALIASES[property] : property;
    return [aliased, ...rest].join(',');
};

/**
 * The generated operations serialize `''` and `[]`, which the hand-written services guarded
 * against and the backend does not read as "no filter": `base_class=` makes `GET /resources`
 * fail outright (every autocomplete comes back empty) and `q=` flips an endpoint into search
 * mode, where it orders by label and ignores `sort`. `false` and `0` are kept.
 */
const isEmptyValue = (value: unknown) => value === '' || (Array.isArray(value) && value.length === 0);

// cast back to T: only optional filters are ever blank, and callers still need the required ones
const dropEmpty = <T extends Record<string, unknown>>(params: T) =>
    Object.fromEntries(Object.entries(params).filter(([, value]) => !isEmptyValue(value))) as T;

/**
 * Transform pagination parameters to match backend API spec, also apply default params
 *
 * When `q` is set the endpoint ranks by relevance and ignores `sort`, so `sort` is left off. A
 * pre-formatted `sort` is aliased like `sortBy`, so camelCase cannot slip past either route.
 */
export const transformPaginationParams = <
    T extends SortByParam & { size?: number; page?: number; q?: string | null; exact?: boolean; sort?: string[] },
>({
    sortBy,
    size,
    page,
    ...params
}: T) => {
    const { q, exact, sort, ...rest } = params;
    const isSearching = typeof q === 'string' && q.trim() !== '';

    const resolvedSort = sort?.map(aliasSortToken) ?? sortBy?.map(({ property, direction }) => aliasSortToken(`${property},${direction}`));

    return {
        ...(isSearching ? {} : { sort: resolvedSort ?? ['created_at,desc'] }),
        size: size ?? 9999,
        page: page ?? 0,
        ...(isSearching ? { q, exact } : {}),
        ...dropEmpty(rest),
    };
};
