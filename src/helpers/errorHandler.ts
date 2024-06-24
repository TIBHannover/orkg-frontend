import { toast } from 'react-toastify';
import { BackendError } from 'services/backend/error';
import { ApiError } from 'services/backend/types';

const errorHandler = ({ error, shouldShowToast = false }: { error: unknown; shouldShowToast?: boolean }) => {
    console.error(error);

    // if the error comes from the backend
    if (error && typeof error === 'object' && 'error' in error && error.error === 'Bad Request') {
        const apiError = error as ApiError;
        if (apiError.errors && apiError.errors?.length > 0 && shouldShowToast) {
            toast.error(`An error occurred. The ${apiError.errors[0].field} ${apiError.errors[0].message}`);
        }
        throw new BackendError(`Backend error: ${apiError.error}`, apiError);
    } else {
        if (error instanceof Error && shouldShowToast) {
            toast.error(error.message);
        }
        throw error;
    }
};

export default errorHandler;
