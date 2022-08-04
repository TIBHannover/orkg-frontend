import PaperCard from 'components/PaperCard/PaperCard';
import PropTypes from 'prop-types';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const ExistingTitleModal = ({ existingPaper, toggle, onContinue }) => (
    <Modal size="lg" isOpen backdrop="static">
        <ModalHeader toggle={toggle}>Warning: Paper already in ORKG</ModalHeader>
        <ModalBody>
            <Alert color="warning">
                The paper "{existingPaper.title}" exists already in the ORKG. Please view the paper and contribute to improve the content. In case you
                want you can continue to create a new paper.
            </Alert>
            <strong>Existing paper:</strong>
            <div className="list-group">
                <PaperCard paper={existingPaper} showAddToComparison={false} />
            </div>
        </ModalBody>
        <ModalFooter>
            <Button
                color="primary"
                onClick={() => {
                    toggle();
                    if (onContinue) {
                        onContinue();
                    }
                }}
            >
                Continue
            </Button>
        </ModalFooter>
    </Modal>
);

ExistingTitleModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    existingPaper: PropTypes.object.isRequired,
    onContinue: PropTypes.func,
};

export default ExistingTitleModal;
