import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';

import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

const Confirmation = ({ proceedLabel, cancelLabel, title, message, proceed, enableEscape = true }) => (
    <Modal isOpen toggle={() => proceed(false)} backdrop={!!enableEscape}>
        <ModalHeader toggle={() => proceed(false)}>{title}</ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
            <Button color="light" onClick={() => proceed(false)}>
                {cancelLabel}
            </Button>
            <Button color="primary" onClick={() => proceed(true)}>
                {proceedLabel}
            </Button>
        </ModalFooter>
    </Modal>
);

Confirmation.propTypes = {
    proceedLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    proceed: PropTypes.func, // called when ok button is clicked.
    enableEscape: PropTypes.bool,
};

const Confirm = ({ message, title = 'Are you sure?', proceedLabel = 'Ok', cancelLabel = 'Cancel', options = {} }) =>
    new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const handleResolve = (result) => {
            root.unmount();
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
            resolve(result);
        };

        root.render(
            <Confirmation
                title={title}
                message={message}
                proceedLabel={proceedLabel}
                cancelLabel={cancelLabel}
                {...options}
                proceed={handleResolve}
            />,
        );
    });

export default Confirm;
