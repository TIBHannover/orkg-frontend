import PropTypes from 'prop-types';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const PreventModal = ({ isOpen, toggle, header, content }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>{header}</ModalHeader>
        <ModalBody>{content}</ModalBody>
        <ModalFooter className="d-flex justify-content-center">
            <Button onClick={toggle} color="primary">
                Close
            </Button>
        </ModalFooter>
    </Modal>
);

PreventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    header: PropTypes.string.isRequired,
};

export default PreventModal;
