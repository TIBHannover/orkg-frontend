import { Modal } from '@heroui/react';
import { FC } from 'react';

import DialogHeader from '@/components/DataBrowser/components/Header/DialogHeader';
import DataBrowser from '@/components/DataBrowser/DataBrowser';

type DataBrowserDialogProps = {
    isEditMode?: boolean;
    id: string;
    show: boolean;
    toggleModal: () => void;
    onCloseModal?: () => void;
    showFooter?: boolean;
    comparisonSelectedPaths?: string[][];
    historyPrefix?: string[];
    scopeKey?: string;
};

const DataBrowserDialog: FC<DataBrowserDialogProps> = ({
    isEditMode = false,
    id,
    show,
    toggleModal,
    onCloseModal,
    showFooter = true,
    comparisonSelectedPaths,
    historyPrefix,
    scopeKey,
}) => {
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggleModal();
            onCloseModal?.();
        }
    };

    return (
        <Modal.Backdrop isOpen={show} onOpenChange={handleOpenChange} className="z-[1055]">
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-6xl">
                    <Modal.CloseTrigger />
                    <Modal.Body>
                        {show && (
                            <DataBrowser
                                isEditMode={isEditMode}
                                key={id}
                                id={id}
                                canEditSharedRootLevel
                                showFooter={showFooter}
                                comparisonSelectedPaths={comparisonSelectedPaths}
                                historyPrefix={historyPrefix}
                                scopeKey={scopeKey}
                                // Dialogs keep history local ("history lives where open-state
                                // lives"): their open-state is a local flag, so URL entries they
                                // wrote could never reopen them and would be orphaned in shareable
                                // URLs. Scoped dialogs (comparison cells/column headers) pass
                                // scopeKey, which forces URL storage regardless.
                                historyStorage="local"
                                renderAboveHeader={() => <DialogHeader />}
                            />
                        )}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default DataBrowserDialog;
