import { toast } from '@heroui/react';

import { BackendError } from '@/services/backend/error';
import { normalizeProblemDetails, pointerToFieldPath } from '@/services/backend/problemDetails';

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

    const getLabelByField = (field: string) => fieldLabels[field] ?? field;

    // RFC 9457 problem response from the backend (with fallback to the deprecated fields).
    const problem = normalizeProblemDetails(error);
    if (problem) {
        if (shouldShowToast) {
            const [firstFieldError] = problem.errors;
            if (firstFieldError) {
                toast.danger(`An error occurred. The ${getLabelByField(pointerToFieldPath(firstFieldError.pointer))} ${firstFieldError.detail}`);
            } else if (problem.detail ?? problem.title) {
                toast.danger(problem.detail ?? problem.title);
            }
        }
        throw new BackendError(`Backend error: ${problem.title ?? problem.status ?? 'unknown'}`, problem);
    }

    if (shouldShowToast) {
        if (error instanceof Error) {
            toast.danger(error.message);
        } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
            toast.danger(error.message);
        }
    }
    throw error;
};

export default errorHandler;
