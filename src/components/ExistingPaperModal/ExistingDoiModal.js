import PaperCard from 'components/PaperCard/PaperCard';
import PropTypes from 'prop-types';
import { Alert, Modal, ModalBody, ModalHeader } from 'reactstrap';

const ExistingDoiModal = ({ existingPaper, toggle }) => (
    <Modal size="lg" isOpen backdrop="static">
        <ModalHeader toggle={toggle}>Error: Paper already in ORKG</ModalHeader>
        <ModalBody>
            <Alert color="danger">
                A paper with DOI "{existingPaper.doi?.label}" exists already in the ORKG. Please view the paper and contribute to improve the content.
            </Alert>
            <strong>Existing paper</strong>
            <div className="list-group">
                <PaperCard paper={existingPaper} showAddToComparison={false} />
            </div>
        </ModalBody>
    </Modal>
);

ExistingDoiModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    existingPaper: PropTypes.object.isRequired,
};

export default ExistingDoiModal;
