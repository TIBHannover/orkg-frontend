import Autocomplete from 'components/Autocomplete/Autocomplete';
import SdgBox from 'components/SustainableDevelopmentGoals/SdgBox';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { updateObservatory } from 'services/backend/observatories';

type ResearchField = {
    id: string;
    label: string;
};

type Sdg = {
    id: string;
    label: string;
};

type EditObservatoryProps = {
    showDialog: boolean;
    toggle: () => void;
    label: string;
    id: string;
    description: string;
    researchField: ResearchField | null;
    sdgs: Sdg[];
    updateObservatoryMetadata: (label: string, description: string, researchField: ResearchField | null, sdgs: Sdg[]) => void;
};

const EditObservatory: React.FC<EditObservatoryProps> = ({
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
    const [isLoadingName, setIsLoadingName] = useState(false);
    const [isLoadingDescription, setIsLoadingDescription] = useState(false);
    const [researchField, setResearchField] = useState(initialResearchField);
    const [isLoadingResearchField, setIsLoadingResearchField] = useState(false);
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'label') {
            setLabel(value);
        } else if (name === 'description') {
            setDescription(value);
        }
    };
    const updateObservatoryData = async (id: string, name: string, description: string, researchField: ResearchField | null, sdgs: Sdg[]) => {
        setIsLoadingName(true);
        setIsLoadingDescription(true);
        setIsLoadingResearchField(true);

        try {
            await updateObservatory(id, {
                name,
                description,
                research_field: researchField?.id,
                sdgs: sdgs.map((sdg: Sdg) => sdg?.id),
            });
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) {
                toast.error(`Error updating an observatory: ${error.message}`);
            } else {
                toast.error('Error updating an observatory');
            }
        } finally {
            setIsLoadingName(false);
            setIsLoadingDescription(false);
            setIsLoadingResearchField(false);
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.dismiss();

        if (label !== initialLabel && label.length === 0) {
            toast.error('Please enter an observatory name');
            return;
        }

        if (description !== initialDescription && description.length === 0) {
            toast.error('Please enter an observatory description');
            return;
        }

        if (!isEqual(researchField, initialResearchField) && researchField === null) {
            toast.error('Please enter an observatory research field');
            return;
        }

        await updateObservatoryData(id, label, description, researchField, sdgs);
        toast.success('Observatory updated successfully');
        updateObservatoryMetadata(label, description, researchField, sdgs);
        toggle();
    };

    const isLoading = isLoadingName || isLoadingDescription || isLoadingResearchField;

    return (
        <Modal size="lg" isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Update observatory</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="observatory-name">Name</Label>
                    <Input
                        onChange={handleChange}
                        type="text"
                        name="label"
                        id="observatory-name"
                        value={label}
                        placeholder="Name"
                        disabled={isLoading}
                        maxLength={MAX_LENGTH_INPUT}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="observatory-research-field">Research field</Label>
                    <Autocomplete
                        inputId="observatory-research-field"
                        entityType={ENTITIES.RESOURCE}
                        includeClasses={[CLASSES.RESEARCH_FIELD]}
                        placeholder="Select research field"
                        onChange={(value, { action }) => {
                            if (action === 'select-option') {
                                setResearchField(value);
                            }
                        }}
                        allowCreate={false}
                        value={researchField && researchField.id ? researchField : null}
                        enableExternalSources={false}
                        isDisabled={isLoading}
                    />
                    {/* <AutoComplete
                        inputId="observatory-research-field"
                        entityType={ENTITIES.RESOURCE}
                        optionsClass={CLASSES.RESEARCH_FIELD}
                        placeholder="Select research field"
                        onItemSelected={async (rf: ResearchField) => {
                            setResearchField({ ...rf, label: rf.value });
                        }}
                        value={researchField && researchField.id ? researchField : null}
                        allowCreate={false}
                        ols={false}
                        autoLoadOption
                        isDisabled={isLoading}
                    /> */}
                </FormGroup>
                <FormGroup>
                    <Label for="observatory-description">Description</Label>
                    <Input
                        onChange={handleChange}
                        type="textarea"
                        name="description"
                        id="observatory-description"
                        value={description}
                        rows={4}
                        disabled={isLoading}
                        maxLength={MAX_LENGTH_INPUT}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Sustainable development goals</Label>
                    <SdgBox handleSave={setSdgs} sdgs={sdgs} maxWidth="100%" isEditable />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    <Button color="primary" disabled={isLoading} onClick={handleSubmit}>
                        {isLoading && <span className="fa fa-spinner fa-spin" />} Save
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};
export default EditObservatory;
