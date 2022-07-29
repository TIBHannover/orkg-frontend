import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap';
import { createClass } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { PREDICATES } from 'constants/graphSettings';
import { createLiteralStatement } from 'services/backend/statements';
import REGEX from 'constants/regex';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getErrorMessage } from 'utils';

function CreateClassModal(props) {
    const isURI = new RegExp(REGEX.URL).test(props.label.trim());
    const [uri, setUri] = useState(props.uri ? props.uri : isURI ? props.label.trim() : '');
    const [label, setLabel] = useState(isURI ? '' : props.label.trim());
    const [errors, setErrors] = useState(null);
    const [description, setDescription] = useState('');

    const handleConfirm = async () => {
        setErrors(null);
        if (label.trim() !== '') {
            if (uri && !new RegExp(REGEX.URL).test(uri.trim())) {
                toast.error('Please enter a valid URI of the class');
            } else {
                try {
                    const newClass = await createClass(label, uri || null);
                    if (description && description.trim() !== '') {
                        const descriptionLiteral = await createLiteral(description);
                        createLiteralStatement(newClass.id, PREDICATES.DESCRIPTION, descriptionLiteral.id);
                    }
                    props.onClose(newClass);
                    setErrors(null);
                } catch (error) {
                    setErrors(error);
                }
            }
        } else {
            toast.error('Please enter the label of the class');
        }
    };

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
                        invalid={Boolean(getErrorMessage(errors, 'uri'))}
                    />
                    {Boolean(getErrorMessage(errors, 'uri')) && <FormFeedback>{getErrorMessage(errors, 'uri')}</FormFeedback>}
                    <FormText color="muted">Please provide the URI of the class if you are using a class defined in an external ontology</FormText>
                </FormGroup>

                <FormGroup className="mt-4">
                    <Label for="property-description">Description</Label>
                    <Input
                        onChange={e => setDescription(e.target.value)}
                        value={description}
                        type="text"
                        id="property-description"
                        placeholder="E.g. Set of collection of objects"
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={() => props.onClose(false)}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleConfirm}>
                    Create class
                </Button>
            </ModalFooter>
        </Modal>
    );
}

CreateClassModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    uri: PropTypes.string,
};

export default CreateClassModal;
