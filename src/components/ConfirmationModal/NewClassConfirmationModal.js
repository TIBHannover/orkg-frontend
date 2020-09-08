import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, FormText } from 'reactstrap';
import PropTypes from 'prop-types';

function CreateClassModal(props) {
    const [uri, setUri] = useState('');

    return (
        <Modal isOpen toggle={() => props.onClose(false)}>
            <ModalHeader toggle={() => props.onClose(false)}>Are you sure you need a new class?</ModalHeader>
            <ModalBody>
                <p>Often there are existing classes that you can use as well. It is better to use existing classes than new ones.</p>
                <FormGroup>
                    <Label for="labelInput">Label</Label>
                    <Input disabled type="text" name="label" id="labelInput" value={props.label} />
                </FormGroup>
                <FormGroup>
                    <Label for="URIInput">URI</Label>
                    <Input
                        type="uri"
                        name="uri"
                        id="URIInput"
                        value={uri}
                        placeholder="Enter the URI of the class"
                        onChange={e => setUri(e.target.value)}
                    />
                    <FormText color="muted">Please provide the url of the class if you are using a class defined in an external ontology</FormText>
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => props.onClose({ label: props.label, uri: uri })}>
                    Create class
                </Button>{' '}
                <Button color="secondary" onClick={() => props.onClose(false)}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

CreateClassModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired
};

export default CreateClassModal;
