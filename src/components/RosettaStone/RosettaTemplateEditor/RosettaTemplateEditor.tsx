import { Button, Separator } from '@heroui/react';
import { FC } from 'react';

import useSaveStatementType from '@/components/RosettaStone/RosettaTemplateEditor/hooks/useSaveStatementType';
import StepOne from '@/components/RosettaStone/RosettaTemplateEditor/StepOne';
import StepThree from '@/components/RosettaStone/RosettaTemplateEditor/StepThree';
import StepTwo from '@/components/RosettaStone/RosettaTemplateEditor/StepTwo';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';

type RosettaTemplateEditorProps = {
    saveButtonText: string;
    onCancel?: () => void;
    onCreate?: (template: string) => void;
};

const RosettaTemplateEditor: FC<RosettaTemplateEditorProps> = ({ saveButtonText, onCancel, onCreate }) => {
    const { isSaving } = useRosettaTemplateEditorState();

    const { handleSaveStatementType } = useSaveStatementType();

    const dispatch = useRosettaTemplateEditorDispatch();

    const handleNext = async () => {
        const templateID = await handleSaveStatementType();
        if (templateID) {
            onCreate?.(templateID);
            dispatch({ type: 'initState', payload: null });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <StepOne />
            <StepTwo />
            <StepThree />
            <Separator />
            <div className="flex justify-end gap-2">
                <Button variant="secondary" isDisabled={isSaving} onPress={() => onCancel?.()}>
                    Cancel
                </Button>
                <Button variant="primary" isDisabled={isSaving} onPress={handleNext}>
                    {saveButtonText}
                </Button>
            </div>
        </div>
    );
};
export default RosettaTemplateEditor;
