import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../../network';
import { ListGroup, ListGroupItem, Collapse, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../../Utils/Tooltip';
import styles from '../Contributions.module.scss';

class DeleteStatement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDeleteModal: false,
        }
    }

    toggleDeleteModal = (e) => {
        e.stopPropagation();

        this.setState(prevState => ({
            showDeleteModal: !prevState.showDeleteModal
        }));
    }

    deleteStatement = () => {
        this.props.handleDelete();

        this.setState({
            showDeleteModal: false
        });
    }

    render() {

        return (
            <>
                <span className={`${styles.deletePredicate} float-right mr-4`} onClick={this.toggleDeleteModal}>
                    <Tooltip message="Delete statement" hideDefaultIcon={true}>
                        <Icon icon={faTrash} /> Delete
                    </Tooltip>
                </span>

                <Modal isOpen={this.state.showDeleteModal} toggle={this.toggleDeleteModal}>
                    <ModalHeader toggle={this.toggleDeleteModal}>Are you sure?</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this statement and its related values?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={this.toggleDeleteModal}>Cancel</Button>{' '}
                        <Button color="primary" onClick={this.deleteStatement}>Delete</Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

export default DeleteStatement;