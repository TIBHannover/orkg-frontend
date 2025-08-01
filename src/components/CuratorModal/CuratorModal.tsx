import { faExternalLinkAlt, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';

import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type CuratorModalProps = {
    toggle: () => void;
};

const CuratorModal: FC<CuratorModalProps> = ({ toggle }) => (
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

export default CuratorModal;
