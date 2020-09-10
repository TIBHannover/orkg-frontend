import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, FormText } from 'reactstrap';
import REGEX from 'constants/regex';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

function CreateClassModal(props) {
    const isURI = new RegExp(REGEX.URL).test(props.label.trim());
    const [uri, setUri] = useState(props.uri ? props.uri : isURI ? props.label.trim() : '');
    const [label, setLabel] = useState(isURI ? '' : props.label.trim());

    return (
        <Modal isOpen toggle={() => props.onClose(false)}>
            <ModalHeader toggle={() => props.onClose(false)}>Are you sure you need a new class?</ModalHeader>
            <ModalBody>
                <p>Often there are existing classes that you can use as well. It is better to use existing classes than new ones.</p>
                <FormGroup>
                    <Label for="labelInput">Label</Label>
                    <Input disabled={!isURI} type="text" name="label" id="labelInput" value={label} onChange={e => setLabel(e.target.value)} />
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
                <Button
                    color="primary"
                    onClick={() => {
                        if (label.trim() !== '') {
                            if (uri && !new RegExp(REGEX.URL).test(uri.trim())) {
                                toast.error('Please enter a valid URI of the class');
                            } else {
                                props.onClose({ label: label, uri: uri });
                            }
                        } else {
                            toast.error('Please enter the label of the class');
                        }
                    }}
                >
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
    label: PropTypes.string.isRequired,
    uri: PropTypes.string
};

export default CreateClassModal;
