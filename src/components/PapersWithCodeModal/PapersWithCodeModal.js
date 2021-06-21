import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const PapersWithCodeModal = ({ isOpen, toggle, label }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>We are working on it!</ModalHeader>
            <ModalBody>
                This resource was imported from an external source and our provenance feature is in active development, and due to that, this resource
                cannot be edited. <br />
                Meanwhile, you can visit{' '}
                <a
                    href={label ? `https://paperswithcode.com/search?q_meta=&q_type=&q=${label}` : 'https://paperswithcode.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    paperswithcode <Icon icon={faExternalLinkAlt} className="mr-1" />
                </a>{' '}
                website to suggest changes.
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button onClick={toggle} color="primary" className="float-right">
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

PapersWithCodeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    label: PropTypes.string
};

export default PapersWithCodeModal;
