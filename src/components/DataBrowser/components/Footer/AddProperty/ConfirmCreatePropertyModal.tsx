import { FC, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import { SmartDescriptiveProperty } from '@/components/SmartSuggestions/DescriptivePropertySuggestions';
import { PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { createLiteral } from '@/services/backend/literals';
import { createPredicate } from '@/services/backend/predicates';
import { createLiteralStatement } from '@/services/backend/statements';

type ConfirmCreatePropertyModalProps = {
    label: string;
    isOpen: boolean;
    toggle: () => void;
    onCreate?: (property: { description?: string; label?: string; id: string }) => void;
};

const ConfirmCreatePropertyModal: FC<ConfirmCreatePropertyModalProps> = ({ label, isOpen, toggle, onCreate }) => {
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        let id = null;
        try {
            const property = await createPredicate(label);
            if (description && description.trim() !== '') {
                const descriptionLiteral = await createLiteral(description);
                await createLiteralStatement(property.id, PREDICATES.DESCRIPTION, descriptionLiteral.id);
            }
            id = property.id;
            onCreate?.({ description, label, id });
            toggle();
        } catch (e) {
            toast.error('An error occurred while creating the property. Please reload the page and try again');
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Are you sure you need a new property ?</ModalHeader>
            <ModalBody>
                <div className="mb-1">
                    Label: <i>{label}</i>
                </div>
                Often there are existing properties that you can use as well. It is better to use existing properties than new ones.
                <FormGroup>
                    <div className="position-relative">
                        <Input
                            type="textarea"
                            name="description"
                            value={description}
                            id="property-description"
                            placeholder="E.g. date of acceptance of the resource"
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                            rows={5}
                            className="mt-2"
                        />
                        <SmartDescriptiveProperty propertyLabel={label} setDescription={setDescription} />
                    </div>
                </FormGroup>
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

export default ConfirmCreatePropertyModal;
