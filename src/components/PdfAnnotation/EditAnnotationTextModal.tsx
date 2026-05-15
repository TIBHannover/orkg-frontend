import { Alert, Button, Modal, TextArea } from '@heroui/react';
import { Dispatch, FC, SetStateAction } from 'react';

import { MAX_LENGTH_INPUT } from '@/constants/misc';

type EditAnnotationTextModalProps = {
    value: string | null;
    setValue: Dispatch<SetStateAction<string | null>>;
    isOpen: boolean;
    toggle: () => void;
    handleDone: () => void;
};

const EditAnnotationTextModal: FC<EditAnnotationTextModalProps> = ({ value, setValue, isOpen, toggle, handleDone }) => (
    <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
            if (!open) toggle();
        }}
        isDismissable
    >
        <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.CloseTrigger />
                    <Modal.Heading>Edit text</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-6 space-y-4">
                    <Alert>
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Description>
                                Only edit the text to fix issues in the extracted sentence. Do not change the sentence itself
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                    <TextArea fullWidth rows={5} maxLength={MAX_LENGTH_INPUT} value={value ?? ''} onChange={(e) => setValue(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onPress={handleDone}>
                        Done
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default EditAnnotationTextModal;
