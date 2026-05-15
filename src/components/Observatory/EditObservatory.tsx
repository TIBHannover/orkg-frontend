import { Input, Label, Modal, TextArea, TextField, toast } from '@heroui/react';
import { isEqual } from 'lodash';
import { FC, useEffect, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import SdgBox from '@/components/SustainableDevelopmentGoals/SdgBox';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { updateObservatory } from '@/services/backend/observatories';
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

    useEffect(() => {
        setLabel(initialLabel);
    }, [initialLabel]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    useEffect(() => {
        setResearchField(initialResearchField);
    }, [initialResearchField]);

    const updateObservatoryData = async (
        observatoryId: string,
        name: string,
        observatoryDescription: string,
        observatoryResearchField: Node | null,
        observatorySdgs: Node[],
    ) => {
        setIsLoading(true);
        try {
            await updateObservatory(observatoryId, {
                name,
                description: observatoryDescription,
                research_field: observatoryResearchField?.id,
                sdgs: observatorySdgs.map((sdg: Node) => sdg?.id),
            });
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) {
                toast.danger(`Error updating an observatory: ${error.message}`);
            } else {
                toast.danger('Error updating an observatory');
            }
        } finally {
            setIsLoading(false);
        }
    };

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

        await updateObservatoryData(id, label, description, researchField, sdgs);
        toast.success('Observatory updated successfully');
        updateObservatoryMetadata(label, description, researchField, sdgs);
        toggle();
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
                    <Modal.Body className="p-6">
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
