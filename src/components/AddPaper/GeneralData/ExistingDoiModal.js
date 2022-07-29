import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Alert, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import PaperCard from 'components/PaperCard/PaperCard';

const ExistingDoiModal = props => {
    const [show, setShow] = useState(true);
    const toggle = () => setShow(!show);

    return (
        <Modal size="lg" isOpen={show} backdrop="static">
            <ModalHeader toggle={toggle}>Warning: Paper already in ORKG</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    The paper <i>`{props.existingPaper.doi?.label || props.existingPaper.title}`</i> exists already in the ORKG. Please view the paper
                    and contribute to improve the content. In case you want you can continue to create a new paper.
                </Alert>
                <strong>Existing paper:</strong>
                <div className="list-group">
                    <PaperCard paper={props.existingPaper} showAddToComparison={false} />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={() => {
                        toggle();
                        if (props.onContinue) {
                            props.onContinue();
                        }
                    }}
                >
                    Continue
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ExistingDoiModal.propTypes = {
    existingPaper: PropTypes.object.isRequired,
    onContinue: PropTypes.func,
};

export default ExistingDoiModal;
