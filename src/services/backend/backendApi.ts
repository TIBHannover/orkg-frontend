import ky from 'ky';
import { getSession, signOut } from 'next-auth/react';

let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;
let pendingTokenPromise: Promise<string | null> | null = null;

const getAccessToken = async (): Promise<string | null> => {
    const EXPIRY_BUFFER_TIME = 60 * 1000; // 60 seconds
    if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
        return cachedToken;
    }
    if (pendingTokenPromise) {
        return pendingTokenPromise;
    }
    pendingTokenPromise = (async () => {
        const session = await getSession();
        if (session?.error === 'RefreshTokenError') {
            await signOut();
            return null;
        }
        const token = session?.access_token;
        const expiresAt = session?.expires_at ? session.expires_at * 1000 : null; // Convert to milliseconds
        if (token && expiresAt) {
            // Calculate expiry time with buffer
            tokenExpiryTime = expiresAt - EXPIRY_BUFFER_TIME;
            if (Date.now() < tokenExpiryTime) {
                cachedToken = token;
                return token;
            }
        }
        return null;
    })().finally(() => {
        pendingTokenPromise = null;
    });
    return pendingTokenPromise;
};

const backendApi = ky.create({
    timeout: 1000 * 60 * 10, // 10 minutes
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
