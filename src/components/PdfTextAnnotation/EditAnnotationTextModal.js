import { Modal, ModalBody, ModalHeader, Alert, Input, ModalFooter, Button } from 'reactstrap';
import PropTypes from 'prop-types';

const EditAnnotationTextModal = ({ value = '', setValue, isOpen, toggle, handleDone }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Edit text</ModalHeader>
        <ModalBody>
            <Alert color="info">Only edit the text to fix issues in the extracted sentence. Do not change the sentence itself</Alert>
            <Input type="textarea" rows="5" value={value} onChange={e => setValue(e.target.value)} />
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
