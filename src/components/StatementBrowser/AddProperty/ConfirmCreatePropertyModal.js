import { useState } from 'react';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { createPredicate } from 'services/backend/predicates';
import { createLiteral } from 'services/backend/literals';
import { createLiteralStatement } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import { toast } from 'react-toastify';

const ConfirmCreatePropertyModal = ({ toggle, onCreate, shouldPerformCreate = false, shouldHideDescriptionInput = false, label }) => {
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        let id = null;
        if (shouldPerformCreate) {
            try {
                const property = await createPredicate(label);
                if (description && description.trim() !== '') {
                    const descriptionLiteral = await createLiteral(description);
                    createLiteralStatement(property.id, PREDICATES.DESCRIPTION, descriptionLiteral.id);
                }
                id = property.id;
            } catch (e) {
                toast.error('An error occurred while creating the property. Please reload the page and try again');
            }
        }
        onCreate({ description, label, id });
    };

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Are you sure you need a new property?</ModalHeader>
            <ModalBody>
                Often there are existing properties that you can use as well. It is better to use existing properties than new ones.
                {!shouldHideDescriptionInput && (
                    <FormGroup className="mt-4">
                        <Label for="property-description">Property description</Label>
                        <Input
                            onChange={e => setDescription(e.target.value)}
                            value={description}
                            type="text"
                            id="property-description"
                            placeholder="E.g. date of acceptance of the resource"
                        />
                    </FormGroup>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleCreate}>
                    Create
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ConfirmCreatePropertyModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    shouldPerformCreate: PropTypes.bool,
    label: PropTypes.string.isRequired,
    shouldHideDescriptionInput: PropTypes.bool,
};

export default ConfirmCreatePropertyModal;
