import { Modal, ModalBody, ModalHeader, Alert, Input, ModalFooter, Button } from 'reactstrap';
import PropTypes from 'prop-types';

const EditAnnotationTextModal = props => (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
        <ModalHeader toggle={props.toggle}>Edit text</ModalHeader>
        <ModalBody>
            <Alert color="info">Only edit the text to fix issues in the extracted sentence. Do not change the sentence itself</Alert>
            <Input type="textarea" rows="5" value={props.value} onChange={e => props.setValue(e.target.value)} />
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={props.handleDone}>
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

EditAnnotationTextModal.defaultProps = {
    value: '',
};

export default EditAnnotationTextModal;
