import ky from 'ky';
import { getToken, isLoggedIn } from 'services/keycloak';

const backendApi = ky.create({
    timeout: 1000 * 60 * 10, // 10 minutes
    hooks: {
        beforeRequest: [
            async (request) => {
                if (isLoggedIn()) {
                    const token = await getToken();
                    if (token) {
                        request.headers.set('Authorization', `Bearer ${token}`);
                    }
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
