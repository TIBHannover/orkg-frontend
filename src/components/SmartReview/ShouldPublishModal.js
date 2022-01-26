import PropTypes from 'prop-types';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const ShouldPublishModal = ({ show, toggle, openPublishModal }) => (
    <Modal isOpen={show} toggle={toggle}>
        <ModalHeader toggle={toggle}>Publish article</ModalHeader>
        <ModalBody>Do you want to publish a new version of this article?</ModalBody>
        <ModalFooter>
            <Button color="light" onClick={toggle}>
                Cancel
            </Button>
            <Button
                color="primary"
                onClick={() => {
                    toggle();
                    openPublishModal();
                }}
            >
                Yes
            </Button>
        </ModalFooter>
    </Modal>
);

ShouldPublishModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    openPublishModal: PropTypes.func.isRequired
};

export default ShouldPublishModal;
