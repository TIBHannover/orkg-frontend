import { Button, Description, FieldError, Input, Label, Modal, TextField, toast } from '@heroui/react';
import { useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import CopyIdButton from '@/components/Autocomplete/ValueButtons/CopyIdButton';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import { createClass, getClassById, setParentClassByID } from '@/services/backend/classes';
import { createLiteral } from '@/services/backend/literals';
import { createLiteralStatement } from '@/services/backend/statements';
import { Class } from '@/services/backend/types';
import { getErrorMessage } from '@/utils';

type NewClassConfirmationModalProps = {
    label: string;
    uri?: string;
    onClose: (result: Class | false) => void;
    showParentField?: boolean;
};

const NewClassConfirmationModal = ({ label: newLabel, uri: newUri, onClose, showParentField = true }: NewClassConfirmationModalProps) => {
    const isURI = new RegExp(REGEX.URL).test(newLabel.trim());
    const [uri, setUri] = useState(newUri || (isURI ? newLabel.trim() : ''));
    const [label, setLabel] = useState(isURI ? '' : newLabel.trim());
    const [parentClass, setParentClass] = useState<SingleValue<OptionType> | null>(null);
    const [errors, setErrors] = useState<unknown>(null);
    const [description, setDescription] = useState('');

    const handleConfirm = async () => {
        setErrors(null);
        if (label.trim() === '') {
            toast.danger('Please enter the label of the class');
            return;
        }
        if (uri && !new RegExp(REGEX.URL).test(uri.trim())) {
            toast.danger('Please enter a valid URI of the class');
            return;
        }
        try {
            const newClassId = await createClass(label, uri || null);
            if (description && description.trim() !== '') {
                const descriptionLiteralId = await createLiteral(description);
                createLiteralStatement(newClassId, PREDICATES.DESCRIPTION, descriptionLiteralId);
            }
            if (parentClass) {
                await setParentClassByID(newClassId, parentClass.id);
            }
            const newClass = await getClassById(newClassId);
            onClose(newClass);
            setErrors(null);
        } catch (error) {
            setErrors(error);
        }
    };

    const handleParentClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (action === 'select-option') {
            setParentClass(selected);
        } else if (action === 'clear') {
            setParentClass(null);
        }
    };

    const uriError = errors ? getErrorMessage(errors as object, 'uri') : null;

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) onClose(false);
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Are you sure you need a new class?</Modal.Heading>
                    </Modal.Header>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void handleConfirm();
                        }}
                    >
                        <Modal.Body className="flex flex-col gap-5 p-6 [&_svg]:text-muted">
                            <p className="text-sm text-muted">
                                Often there are existing classes that you can use as well. It is better to use existing classes than new ones.
                            </p>

                            <TextField
                                fullWidth
                                isDisabled={!isURI}
                                value={label}
                                onChange={setLabel}
                                maxLength={MAX_LENGTH_INPUT}
                                className="flex flex-col gap-1"
                            >
                                <Label htmlFor="labelInput">Label</Label>
                                <Input id="labelInput" name="label" type="text" />
                            </TextField>

                            <TextField fullWidth value={uri} onChange={setUri} isInvalid={Boolean(uriError)} className="flex flex-col gap-1">
                                <Label htmlFor="URIInput">
                                    URI <span className="text-muted font-normal italic">(optional)</span>
                                </Label>
                                <Input id="URIInput" name="uri" type="url" placeholder="Enter the URI of the class" />
                                {uriError ? (
                                    <FieldError>{uriError}</FieldError>
                                ) : (
                                    <Description>
                                        Please provide the URI of the class if you are using a class defined in an external ontology
                                    </Description>
                                )}
                            </TextField>

                            {showParentField && (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="parent-class">
                                        Subclass of <span className="text-muted font-normal italic">(optional)</span>
                                    </Label>
                                    <div className="flex min-h-9 items-stretch">
                                        <div className="min-w-0 flex-1 [&_.react-select__control]:!rounded-e-none">
                                            <Autocomplete
                                                entityType={ENTITIES.CLASS}
                                                placeholder="Select a class"
                                                onChange={handleParentClassSelect}
                                                value={parentClass}
                                                openMenuOnFocus
                                                isClearable
                                                allowCreate={false}
                                                inputId="parent-class"
                                            />
                                        </div>
                                        <CopyIdButton value={parentClass} className="-ms-px !h-9 !rounded-s-none" />
                                    </div>
                                    <Description>Enter the parent class for this new class.</Description>
                                </div>
                            )}

                            <TextField
                                fullWidth
                                value={description}
                                onChange={setDescription}
                                maxLength={MAX_LENGTH_INPUT}
                                className="flex flex-col gap-1"
                            >
                                <Label htmlFor="property-description">Description</Label>
                                <Input id="property-description" type="text" placeholder="E.g. Set of collection of objects" />
                            </TextField>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="ghost" type="button" onPress={() => onClose(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Create class
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default NewClassConfirmationModal;
