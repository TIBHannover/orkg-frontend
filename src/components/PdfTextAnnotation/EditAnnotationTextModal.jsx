import PropTypes from 'prop-types';
import { Alert, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import Button from '@/components/Ui/Button/Button';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

const EditAnnotationTextModal = ({ value = '', setValue, isOpen, toggle, handleDone }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Edit text</ModalHeader>
        <ModalBody>
            <Alert color="info">Only edit the text to fix issues in the extracted sentence. Do not change the sentence itself</Alert>
            <Input type="textarea" maxLength={MAX_LENGTH_INPUT} rows="5" value={value} onChange={(e) => setValue(e.target.value)} />
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={handleDone}>
                Done
            </Button>
        </ModalFooter>
    </Modal>
);

EditAnnotationTextModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    value: PropTypes.string,
    setValue: PropTypes.func.isRequired,
    handleDone: PropTypes.func.isRequired,
};

export default EditAnnotationTextModal;
