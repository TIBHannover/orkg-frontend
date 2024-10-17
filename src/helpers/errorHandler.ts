import { toast } from 'react-toastify';
import { BackendError } from 'services/backend/error';
import { ApiError } from 'services/backend/types';

const errorHandler = ({
    error,
    shouldShowToast = false,
    fieldLabels = {},
}: {
    error: unknown;
    shouldShowToast?: boolean;
    fieldLabels?: { [key: string]: string };
}) => {
    console.error(error);

    const getLabelByField = (field: string) => {
        return fieldLabels[field] ?? field;
    };

    // if the error comes from the backend
    if (error && typeof error === 'object' && 'error' in error && error.error === 'Bad Request') {
        const apiError = error as ApiError;
        if (apiError.errors && apiError.errors?.length > 0 && shouldShowToast) {
            toast.error(`An error occurred. The ${getLabelByField(apiError.errors[0].field)} ${apiError.errors[0].message}`);
        } else {
            toast.error(apiError.message);
        }
        throw new BackendError(`Backend error: ${apiError.error}`, apiError);
    } else {
        if (error && typeof error === 'object' && 'message' in error && shouldShowToast) {
            // @ts-expect-error: error.message is available in the backend error object
            toast.error(error.message);
        }
        if (error instanceof Error && shouldShowToast) {
            toast.error(error.message);
        }
        throw error;
    }
};

export default errorHandler;
