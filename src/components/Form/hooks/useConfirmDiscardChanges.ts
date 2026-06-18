import { useCallback } from 'react';

import Confirm from '@/components/Confirmation/Confirmation';

type UseConfirmDiscardChangesProps = {
    isDirty: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    proceedLabel?: string;
    cancelLabel?: string;
};

const useConfirmDiscardChanges = ({
    isDirty,
    onClose,
    title = 'Discard changes?',
    message = 'You have unsaved changes. If you close now, your changes will be lost.',
    proceedLabel = 'Discard changes',
    cancelLabel = 'Keep editing',
}: UseConfirmDiscardChangesProps) => {
    const requestClose = useCallback(async () => {
        if (isDirty) {
            const confirmed = await Confirm({ title, message, proceedLabel, cancelLabel });
            if (!confirmed) {
                return;
            }
        }
        onClose();
    }, [isDirty, onClose, title, message, proceedLabel, cancelLabel]);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                requestClose();
            }
        },
        [requestClose],
    );

    return { requestClose, handleOpenChange };
};

export default useConfirmDiscardChanges;
