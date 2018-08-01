import React, {Component} from 'react';
import {Button, Form, Modal, Icon, Header} from 'semantic-ui-react';
import {NotificationManager} from 'react-notifications';
import {createResource} from '../helpers.js';

export default class AddResourceModal extends Component {
    state = {
        open: false,
        loading: false,
    }

    name = '';

    constructor(props) {
        super(props);

        this.setState = this.setState.bind(this);
        this.clickCancel = this.clickCancel.bind(this);
        this.clickAdd = this.clickAdd.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    clickCancel() {
        this.closeModal();
    }

    clickAdd() {
        const label = this.name;
        if (label && label.length !== 0) {
            createResource(label, (responseJson) => {
                this.closeModal();
                NotificationManager.success('Resource submitted successfully', 'Success', 5000);
            },
            (error) => {
                this.closeModal();
                console.error(error);
                NotificationManager.error(error.message, 'Error submitting resource', 5000);
            });
        }
        this.setState({ loading: true });
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({ loading: false, open: false });
    }

    render() {
        return <Modal trigger={<Button size='tiny' icon='plus' circular={true} onClick={this.openModal}></Button>}
                onClose={this.closeModal} open={this.state.open}>
            <Header icon='plus square' content='Add resource'/>
            <Modal.Content>
                <Form>
                    <Form.Input label='Resource name' placeholder='Resource name'
                            onChange={(event, data) => this.name = data.value.trim()}/>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={this.clickCancel} color='red' disabled={this.state.loading}>
                    <Icon name='remove'/> Cancel
                </Button>
                <Button onClick={this.clickAdd} color='green' loading={this.state.loading}>
                    <Icon name='checkmark'/> Add
                </Button>
            </Modal.Actions>
        </Modal>
    }
}