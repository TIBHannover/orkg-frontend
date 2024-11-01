import { faExternalLinkAlt, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

const CuratorModal = ({ toggle }) => (
    <Modal isOpen toggle={toggle}>
        <ModalHeader toggle={toggle}>Curator role required</ModalHeader>
        <ModalBody className="py-4">
            <div className="d-flex">
                <FontAwesomeIcon icon={faUserLock} style={{ fontSize: '200%' }} className="text-primary pe-3 pt-2" />
                <div>
                    You need to be an ORKG curator to use this functionality. Please{' '}
                    <a href="https://orkg.org/page/contact" target="_blank" rel="noopener noreferrer">
                        contact us <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>{' '}
                    for more information.
                </div>
            </div>
        </ModalBody>
    </Modal>
);

CuratorModal.propTypes = {
    toggle: PropTypes.func.isRequired,
};

export default CuratorModal;
