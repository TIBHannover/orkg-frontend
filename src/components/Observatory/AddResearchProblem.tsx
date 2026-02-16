import { FC, useState } from 'react';
import { toast } from 'react-toastify';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { CLASSES, ENTITIES, MISC } from '@/constants/graphSettings';
import { updateResource } from '@/services/backend/resources';

type AddResearchProblemProps = {
    showDialog: boolean;
    toggle: () => void;
    id: string;
    afterSubmit: () => void;
};

const AddResearchProblem: FC<AddResearchProblemProps> = ({ showDialog, toggle, id, afterSubmit }) => {
    const [problem, setProblem] = useState<OptionType | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (problem && problem.id) {
            setIsSaving(true);
            try {
                await updateResource(problem.id, { observatory_id: id, organization_id: MISC.UNKNOWN_ID });
                toast.success('Research problem added successfully');
                setIsSaving(false);
                afterSubmit();
                toggle();
                setProblem(null);
            } catch (error: unknown) {
                setIsSaving(false);
                console.error(error);
                toast.error(`Error updating an observatory ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } else {
            toast.error('Please select a research problem');
        }
    };

    return (
        <Modal size="lg" isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Add research problem</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="ResearchProblem">Research problem</Label>
                    <Autocomplete
                        allowCreate={false}
                        entityType={ENTITIES.RESOURCE}
                        includeClasses={[CLASSES.PROBLEM]}
                        placeholder="Select a research problem"
                        onChange={(value, { action }) => {
                            if (action === 'select-option') {
                                setProblem(value);
                            }
                        }}
                        value={problem}
                        enableExternalSources={false}
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    <ButtonWithLoading color="primary" isLoading={isSaving} onClick={handleSubmit}>
                        Save
                    </ButtonWithLoading>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default AddResearchProblem;
