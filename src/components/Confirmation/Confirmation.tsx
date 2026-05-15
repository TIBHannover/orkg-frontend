import { Button, Modal } from '@heroui/react';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

type ConfirmationProps = {
    proceedLabel?: string;
    cancelLabel?: string;
    title?: ReactNode;
    message?: ReactNode;
    proceed: (result: boolean) => void;
    enableEscape?: boolean;
};

const Confirmation = ({ proceedLabel, cancelLabel, title, message, proceed, enableEscape = true }: ConfirmationProps) => (
    <Modal.Backdrop
        isOpen
        isDismissable={enableEscape}
        isKeyboardDismissDisabled={!enableEscape}
        className="z-[1070]"
        onOpenChange={(open) => {
            if (!open) proceed(false);
        }}
    >
        <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
                <Modal.CloseTrigger />
                <Modal.Header>
                    <Modal.Heading>{title}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                    <Button variant="ghost" onPress={() => proceed(false)}>
                        {cancelLabel}
                    </Button>
                    <Button variant="primary" onPress={() => proceed(true)}>
                        {proceedLabel}
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

type ConfirmOptions = Partial<Omit<ConfirmationProps, 'proceed'>>;

type ConfirmArgs = {
    message?: ReactNode;
    title?: ReactNode;
    proceedLabel?: string;
    cancelLabel?: string;
    options?: ConfirmOptions;
};

const Confirm = ({ message, title = 'Are you sure?', proceedLabel = 'Ok', cancelLabel = 'Cancel', options = {} }: ConfirmArgs): Promise<boolean> =>
    new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const handleResolve = (result: boolean) => {
            root.unmount();
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
            resolve(result);
        };

        root.render(
            <Confirmation
                title={title}
                message={message}
                proceedLabel={proceedLabel}
                cancelLabel={cancelLabel}
                {...options}
                proceed={handleResolve}
            />,
        );
    });

export default Confirm;
