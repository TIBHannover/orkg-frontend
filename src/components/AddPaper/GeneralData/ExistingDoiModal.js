import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Alert, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import PaperCard from 'components/PaperCard/PaperCard';

const ExistingDoiModal = props => {
    const [show, setShow] = useState(true);
    const toggle = () => setShow(!show);

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Warning: DOI already in ORKG</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    The DOI <i>`{props.existingPaper.doi}`</i> is already linked in ORKG. Please view the paper and contribute to improve the content.
                    In case you want you can continue to create a new paper for this DOI.
                </Alert>
                <strong>Existing paper:</strong> <PaperCard paper={props.existingPaper} />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggle}>
                    Continue
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ExistingDoiModal.propTypes = {
    existingPaper: PropTypes.object.isRequired
};

export default ExistingDoiModal;
