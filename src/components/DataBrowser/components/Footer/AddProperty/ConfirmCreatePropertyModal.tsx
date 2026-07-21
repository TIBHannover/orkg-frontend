import { Button, Modal, TextArea, TextField, toast } from '@heroui/react';
import { FC, useState } from 'react';

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
        try {
            const propertyId = await createPredicate(label);
            if (description.trim() !== '') {
                const descriptionLiteralId = await createLiteral(description);
                await createLiteralStatement(propertyId, PREDICATES.DESCRIPTION, descriptionLiteralId);
            }
            onCreate?.({ description, label, id: propertyId });
            toggle();
        } catch {
            toast.danger('An error occurred while creating the property. Please reload the page and try again');
        }
    };

    // z-[1060] stacks above the z-[1055] DataBrowserDialog backdrop
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && toggle()} isDismissable className="z-[1060]">
            <Modal.Container>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Are you sure you need a new property?</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="px-0.5 pb-0.5">
                        <div className="mb-1">
                            Label: <i>{label}</i>
                        </div>
                        Often there are existing properties that you can use as well. It is better to use existing properties than new ones.
                        <div className="relative mt-3">
                            <TextField fullWidth value={description} onChange={setDescription} aria-label="Property description">
                                <TextArea
                                    placeholder="E.g. date of acceptance of the resource"
                                    maxLength={MAX_LENGTH_INPUT}
                                    rows={5}
                                    className="mt-2 !border !border-border focus:!border-accent"
                                />
                            </TextField>
                            <SmartDescriptiveProperty propertyLabel={label} setDescription={setDescription} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onPress={toggle}>
                            Cancel
                        </Button>
                        <Button variant="primary" onPress={handleCreate}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ConfirmCreatePropertyModal;
