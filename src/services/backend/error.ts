import { ApiError } from 'services/backend/types';

export class BackendError extends Error {
    public apiError: ApiError;

    constructor(message: string, apiError: ApiError, options?: ErrorOptions) {
        super(message, options);

        this.apiError = apiError;
        this.message = message;
    }
}
