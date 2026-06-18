import { ProblemDetails } from '@/services/backend/problemDetails';

export class BackendError extends Error {
    public apiError: ProblemDetails;

    constructor(message: string, apiError: ProblemDetails, options?: ErrorOptions) {
        super(message, options);

        this.apiError = apiError;
        this.message = message;
    }
}
