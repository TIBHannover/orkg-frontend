import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Form, FormFeedback, FormGroup, FormText, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import CopyIdButton from '@/components/Autocomplete/ValueButtons/CopyIdButton';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import { createClass, setParentClassByID } from '@/services/backend/classes';
import { createLiteral } from '@/services/backend/literals';
import { createLiteralStatement } from '@/services/backend/statements';
import { getErrorMessage } from '@/utils';

function CreateClassModal({ label: newLabel, uri: newUri, onClose, showParentField = true }) {
    const isURI = new RegExp(REGEX.URL).test(newLabel.trim());
    const [uri, setUri] = useState(newUri || (isURI ? newLabel.trim() : ''));
    const [label, setLabel] = useState(isURI ? '' : newLabel.trim());
    const [parentClass, setParentClass] = useState(null);
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
                    if (parentClass) {
                        await setParentClassByID(newClass.id, parentClass.id);
                    }
                    onClose(newClass);
                    setErrors(null);
                } catch (error) {
                    setErrors(error);
                }
            }
        } else {
            toast.error('Please enter the label of the class');
        }
    };

    const handleParentClassSelect = async (selected, { action }) => {
        if (action === 'select-option') {
            setParentClass(selected);
        } else if (action === 'clear') {
            setParentClass(null);
        }
    };

    return (
        <Modal isOpen toggle={() => onClose(false)} size="lg">
            <Form onSubmit={(e) => e.preventDefault()}>
                <ModalHeader toggle={() => onClose(false)}>Are you sure you need a new class?</ModalHeader>
                <ModalBody>
                    <p>Often there are existing classes that you can use as well. It is better to use existing classes than new ones.</p>
                    <FormGroup>
                        <Label for="labelInput">Label</Label>
                        <Input
                            disabled={!isURI}
                            type="text"
                            name="label"
                            id="labelInput"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="URIInput">
                            URI <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <Input
                            type="uri"
                            name="uri"
                            id="URIInput"
                            value={uri}
                            placeholder="Enter the URI of the class"
                            onChange={(e) => setUri(e.target.value)}
                            invalid={Boolean(getErrorMessage(errors, 'uri'))}
                        />
                        {Boolean(getErrorMessage(errors, 'uri')) && <FormFeedback>{getErrorMessage(errors, 'uri')}</FormFeedback>}
                        <small>
                            <FormText color="muted">
                                Please provide the URI of the class if you are using a class defined in an external ontology
                            </FormText>
                        </small>
                    </FormGroup>
                    {showParentField && (
                        <FormGroup>
                            <Label for="URIInput">
                                Subclass of <span className="text-muted fst-italic">(optional)</span>
                            </Label>
                            <InputGroup>
                                <Autocomplete
                                    entityType={ENTITIES.CLASS}
                                    placeholder="Select a class"
                                    onChange={handleParentClassSelect}
                                    value={parentClass}
                                    openMenuOnFocus
                                    isClearable
                                    inputId="target-class"
                                />
                                <CopyIdButton value={parentClass} />
                            </InputGroup>
                            <small>
                                <FormText color="muted">Enter the parent class for this new class.</FormText>
                            </small>
                        </FormGroup>
                    )}
                    <FormGroup className="mt-4">
                        <Label for="property-description">Description</Label>
                        <Input
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                            type="text"
                            id="property-description"
                            placeholder="E.g. Set of collection of objects"
                            maxLength={MAX_LENGTH_INPUT}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={() => onClose(false)}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={handleConfirm}>
                        Create class
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
}

CreateClassModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    uri: PropTypes.string,
    showParentField: PropTypes.bool,
};

export default CreateClassModal;
