import { FC } from 'react';

import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type ShouldPublishModalProps = { toggle: () => void; openPublishModal: () => void };

const ShouldPublishModal: FC<ShouldPublishModalProps> = ({ toggle, openPublishModal }) => (
    <Modal isOpen toggle={toggle}>
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

export default ShouldPublishModal;
