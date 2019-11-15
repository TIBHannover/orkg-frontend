import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';

// This is not used at the moment, requires some changes in order for it te work
class ConfirmModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: true
        };
    }

    toggle = () => {
        this.setState(prevState => ({
            showModal: !prevState.showModal
        }));
    };

    render() {
        return (
            <Modal isOpen={this.state.showModal} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>{this.props.title}</ModalHeader>
                <ModalBody>{this.props.message}</ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={this.toggle}>
                        Cancel
                    </Button>{' '}
                    <Button color="primary" onClick={this.toggle}>
                        OK
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

ConfirmModal.propTypes = {
    message: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

export default ConfirmModal;
