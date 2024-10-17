import StepOne from 'components/RosettaStone/RosettaTemplateEditor/StepOne';
import StepThree from 'components/RosettaStone/RosettaTemplateEditor/StepThree';
import StepTwo from 'components/RosettaStone/RosettaTemplateEditor/StepTwo';
import useSaveStatementType from 'components/RosettaStone/RosettaTemplateEditor/hooks/useSaveStatementType';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { FC } from 'react';
import { Button } from 'reactstrap';

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
        <div>
            <StepOne />
            <StepTwo />
            <StepThree />
            <hr />
            <div className="mt-2 d-flex justify-content-end">
                <Button className="me-2" disabled={isSaving} color="light" onClick={() => onCancel?.()}>
                    Cancel
                </Button>
                <Button disabled={isSaving} color="primary" onClick={handleNext}>
                    {saveButtonText}
                </Button>
            </div>
        </div>
    );
};
export default RosettaTemplateEditor;
