import PropTypes from 'prop-types';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const ObservatoryModal = ({ isOpen, toggle }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Editing not possible</ModalHeader>
        <ModalBody>
            <p>You don't have sufficient rights to edit an observatory. Contact the observatory members to request any changes.</p>
        </ModalBody>
        <ModalFooter>
            <Button color="primary" className="float-end" onClick={toggle}>
                Close
            </Button>
        </ModalFooter>
    </Modal>
);

ObservatoryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default ObservatoryModal;
