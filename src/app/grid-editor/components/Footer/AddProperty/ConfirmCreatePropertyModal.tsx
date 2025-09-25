import { FC, useState } from 'react';
import { toast } from 'react-toastify';

import { SmartDescriptiveProperty } from '@/components/SmartSuggestions/DescriptivePropertySuggestions';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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
            const propertyId = await createPredicate(label);
            if (description && description.trim() !== '') {
                const descriptionLiteralId = await createLiteral(description);
                await createLiteralStatement(propertyId, PREDICATES.DESCRIPTION, descriptionLiteralId);
            }
            id = propertyId;
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
                <div className="tw:mb-1">
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
                            className="tw:mt-2"
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
