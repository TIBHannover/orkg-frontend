import { Alert } from '@heroui/react';

type FormRootErrorProps = {
    /** Message to show, typically `formState.errors.root?.server?.message`. Nothing renders when empty. */
    message?: string;
    /** Heading above the message. */
    title?: string;
    className?: string;
};

/**
 * Form-level error alert for react-hook-form. Renders the `root.server` error set by
 * `applyServerErrorsToForm` (backend problems that can't be attached to a specific field).
 * Returns `null` when there is no message.
 */
const FormRootError = ({ message, title = 'Could not save your changes', className }: FormRootErrorProps) => {
    if (!message) {
        return null;
    }

    return (
        <Alert status="danger" className={className}>
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>{title}</Alert.Title>
                <Alert.Description>{message}</Alert.Description>
            </Alert.Content>
        </Alert>
    );
};

export default FormRootError;
