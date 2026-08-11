import { Button } from '@heroui/react';
import PropTypes from 'prop-types';

import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

const PreventModal = ({ isOpen, toggle, header, content }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>{header}</ModalHeader>
        <ModalBody>{content}</ModalBody>
        <ModalFooter className="flex justify-center">
            <Button onPress={toggle}>
                Close
            </Button>
        </ModalFooter>
    </Modal>
);

PreventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    header: PropTypes.string.isRequired,
};

export default PreventModal;
