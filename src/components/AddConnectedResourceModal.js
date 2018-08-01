import React, {Component} from 'react';
import {Button, Form, Modal, Icon, Header} from 'semantic-ui-react';
import {NotificationManager} from 'react-notifications';
import {createResourceStatement, createLiteralStatement} from '../helpers.js';

export default class AddConnectedResourceModal extends Component {
    state = {
        open: false,
        loading: false,
    }

    objectId = '';
    predicateId = '';
    addedValue = '';

    constructor(props) {
        super(props);

        this.setState = this.setState.bind(this);
        this.clickCancel = this.clickCancel.bind(this);
        this.clickAdd = this.clickAdd.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onResourceCreationSuccess = this.onResourceCreationSuccess.bind(this);
        this.onResourceCreationError = this.onResourceCreationError.bind(this);
    }

    clickCancel() {
        this.closeModal();
    }

    onResourceCreationSuccess(responseJson) {
        this.closeModal();
        NotificationManager.success('Resource submitted successfully', 'Success', 5000);
    }

    onResourceCreationError(error) {
        this.closeModal();
        console.error(error);
        NotificationManager.error(error.message, 'Error submitting resource', 5000);
    }

    clickAdd() {
        if (((this.objectId && this.objectId.length !== 0) || (this.addedValue && this.addedValue.length !== 0)) &&
                this.predicateId && this.predicateId.length !== 0) {
            if (this.addedValue) {
                createLiteralStatement(this.props.subjectId, this.predicateId, this.addedValue,
                        this.onResourceCreationSuccess, this.onResourceCreationError);
            } else {
                createResourceStatement(this.props.subjectId, this.predicateId, this.objectId,
                        this.onResourceCreationSuccess, this.onResourceCreationError);
            }
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
        const allPredicates = this.props.allPredicates.map((predicate) => {
            return { value: predicate.id, text: predicate.label }
        });
        const allResources = this.props.allResources.map((resource) => {
            return { value: resource.id, text: resource.label }
        });

        return <Modal trigger={<Button size='tiny' icon='plus' circular={true} onClick={this.openModal}></Button>}
                onClose={this.closeModal} open={this.state.open}>
            <Header icon='plus square' content='Add resource'/>
            <Modal.Content>
                <p>Linking the resource &quot;{this.props.subjectLabel}&quot;.</p>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Select label='Predicate' options={allPredicates} placeholder='Predicate' search
                                selection onChange={(event, data) => this.predicateId = data.value}/>
                        <Form.Select label='Object' options={allResources} placeholder='Object'
                                search={true} selection={true} allowAdditions={true}
                                onChange={(event, data) => {
                                    this.objectId = data.value;
                                    this.addedValue = null;
                                }}
                                onAddItem={(event, data) => {
                                    this.objectId = null;
                                    this.addedValue = data.value.trim();
                                }}/>
                    </Form.Group>
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