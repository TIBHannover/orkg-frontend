import { Component } from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';

class Confirmation extends Component {
    render() {
        const { proceedLabel, cancelLabel, title, message, proceed, enableEscape = true } = this.props;
        return (
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
    }
}

Confirmation.propTypes = {
    proceedLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    proceed: PropTypes.func, // called when ok button is clicked.
    enableEscape: PropTypes.bool,
};

const Confirm = ({ message, title = 'Are you sure?', proceedLabel = 'Ok', cancelLabel = 'Cancel', options = {} }) =>
    new Promise(resolve => {
        let container = document.createElement('div');
        const root = createRoot(container);
        const handleResolve = result => {
            root.unmount();
            container = null;
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
