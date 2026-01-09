import { Configuration } from '@orkg/orkg-client';
import ky from 'ky';
import { getSession, signOut } from 'next-auth/react';
import { env } from 'next-runtime-env';

let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;
let pendingTokenPromise: Promise<string | null> | null = null;

const getAccessToken = async (): Promise<string | null> => {
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
    basePath: env('NEXT_PUBLIC_BACKEND_URL'),
    fetchApi: async (input: RequestInfo, init?: RequestInit) => {
        const token = await getAccessToken();
        const headers = new Headers(init?.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return fetch(input, { ...init, headers, next: { revalidate: 3600 } });
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
                    } catch (e) {}
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
