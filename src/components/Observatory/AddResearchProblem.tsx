import { Modal, toast } from '@heroui/react';
import { FC, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
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
        if (!problem || !problem.id) {
            toast.danger('Please select a research problem');
            return;
        }
        setIsSaving(true);
        try {
            await updateResource(problem.id, { observatory_id: id, organization_id: MISC.UNKNOWN_ID });
            toast.success('Research problem added successfully');
            afterSubmit();
            toggle();
            setProblem(null);
        } catch (error: unknown) {
            console.error(error);
            toast.danger(`Error updating an observatory ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
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
                        <Modal.Heading>Add research problem</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="ResearchProblem" className="text-sm font-medium">
                                Research problem
                            </label>
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
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonWithLoading variant="primary" isLoading={isSaving} onPress={handleSubmit}>
                            Save
                        </ButtonWithLoading>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default AddResearchProblem;
