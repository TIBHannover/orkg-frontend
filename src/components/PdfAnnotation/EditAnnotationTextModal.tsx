import { Dispatch, FC, SetStateAction } from 'react';

import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

type EditAnnotationTextModalProps = {
    value: string | null;
    setValue: Dispatch<SetStateAction<string | null>>;
    isOpen: boolean;
    toggle: () => void;
    handleDone: () => void;
};

const EditAnnotationTextModal: FC<EditAnnotationTextModalProps> = ({ value, setValue, isOpen, toggle, handleDone }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Edit text</ModalHeader>
        <ModalBody>
            <Alert color="info">Only edit the text to fix issues in the extracted sentence. Do not change the sentence itself</Alert>
            <Input type="textarea" maxLength={MAX_LENGTH_INPUT} rows="5" value={value ?? ''} onChange={(e) => setValue(e.target.value)} />
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={handleDone}>
                Done
            </Button>
        </ModalFooter>
    </Modal>
);

export default EditAnnotationTextModal;
