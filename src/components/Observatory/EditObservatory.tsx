import { Input, Label, Modal, TextArea, TextField, toast } from '@heroui/react';
import { isEqual } from 'lodash';
import { FC, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import SdgBox from '@/components/SustainableDevelopmentGoals/SdgBox';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { updateObservatory } from '@/services/backend/observatories';
import { getBackendErrorMessage } from '@/services/backend/problemDetails';
import { Node } from '@/services/backend/types';

type EditObservatoryProps = {
    showDialog: boolean;
    toggle: () => void;
    label: string;
    id: string;
    description: string;
    researchField: Node | null;
    sdgs: Node[];
    updateObservatoryMetadata: (label: string, description: string, researchField: Node | null, sdgs: Node[]) => void;
};

const EditObservatory: FC<EditObservatoryProps> = ({
    showDialog,
    toggle,
    label: initialLabel,
    id,
    description: initialDescription,
    researchField: initialResearchField,
    sdgs: initialSdgs,
    updateObservatoryMetadata,
}) => {
    const [label, setLabel] = useState(initialLabel);
    const [description, setDescription] = useState(initialDescription);
    const [isLoading, setIsLoading] = useState(false);
    const [researchField, setResearchField] = useState(initialResearchField);
    const [sdgs, setSdgs] = useState(initialSdgs);
    const [prevInitial, setPrevInitial] = useState({
        label: initialLabel,
        description: initialDescription,
        researchField: initialResearchField,
    });
    if (initialLabel !== prevInitial.label || initialDescription !== prevInitial.description || initialResearchField !== prevInitial.researchField) {
        setPrevInitial({
            label: initialLabel,
            description: initialDescription,
            researchField: initialResearchField,
        });
        setLabel(initialLabel);
        setDescription(initialDescription);
        setResearchField(initialResearchField);
    }

    const handleSubmit = async () => {
        toast.clear();

        if (label !== initialLabel && label.length === 0) {
            toast.danger('Please enter an observatory name');
            return;
        }
        if (description !== initialDescription && description.length === 0) {
            toast.danger('Please enter an observatory description');
            return;
        }
        if (!isEqual(researchField, initialResearchField) && researchField === null) {
            toast.danger('Please enter an observatory research field');
            return;
        }

        setIsLoading(true);
        try {
            await updateObservatory(id, {
                name: label,
                description,
                research_field: researchField?.id,
                sdgs: sdgs.map((sdg: Node) => sdg?.id),
            });
            toast.success('Observatory updated successfully');
            updateObservatoryMetadata(label, description, researchField, sdgs);
            toggle();
        } catch (error: unknown) {
            console.error(error);
            toast.danger(`Error updating an observatory: ${await getBackendErrorMessage(error, 'please try again')}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal.Backdrop
            isOpen={showDialog}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]" size="lg">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Update observatory</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="flex flex-col gap-4">
                            <TextField fullWidth name="label" value={label} onChange={setLabel} isDisabled={isLoading}>
                                <Label>Name</Label>
                                <Input placeholder="Name" maxLength={MAX_LENGTH_INPUT} />
                            </TextField>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="observatory-research-field">Research field</Label>
                                <Autocomplete
                                    inputId="observatory-research-field"
                                    entityType={ENTITIES.RESOURCE}
                                    includeClasses={[CLASSES.RESEARCH_FIELD]}
                                    placeholder="Select research field"
                                    onChange={(value, { action }: { action: string }) => {
                                        if (action === 'select-option') {
                                            setResearchField(value);
                                        }
                                    }}
                                    allowCreate={false}
                                    value={researchField && researchField.id ? researchField : null}
                                    enableExternalSources={false}
                                    isDisabled={isLoading}
                                />
                            </div>

                            <TextField
                                fullWidth
                                name="description"
                                value={description}
                                onChange={(value: string) => setDescription(value)}
                                isDisabled={isLoading}
                            >
                                <Label>Description</Label>
                                <TextArea rows={4} maxLength={MAX_LENGTH_INPUT} />
                            </TextField>

                            <div className="flex flex-col gap-1">
                                <Label>Sustainable development goals</Label>
                                <SdgBox handleSave={setSdgs} sdgs={sdgs} maxWidth="100%" isEditable />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonWithLoading variant="primary" isLoading={isLoading} onPress={handleSubmit}>
                            Save
                        </ButtonWithLoading>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default EditObservatory;
