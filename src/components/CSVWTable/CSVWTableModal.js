import PropTypes from 'prop-types';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { useSelector } from 'react-redux';
import CSVWTable from './CSVWTable';

function CSVWTableModal(props) {
    const value = useSelector(state => state.statementBrowser.values.byId[props.id]);

    return (
        <Modal fullscreen isOpen={props.show} toggle={props.toggleModal} size="lg">
            <ModalHeader toggle={props.toggleModal}>View Tabular Data: {value.label}</ModalHeader>
            <ModalBody>
                <CSVWTable id={props.id} toggleModal={props.toggleModal} />
            </ModalBody>
        </Modal>
    );
}

CSVWTableModal.propTypes = {
    id: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
};

export default CSVWTableModal;
