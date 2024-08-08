import StatementPlaceholder from 'components/RosettaStone/RosettaTemplateEditor/StatementPlaceholder';
import StepOne from 'components/RosettaStone/RosettaTemplateEditor/StepOne';
import StepThree from 'components/RosettaStone/RosettaTemplateEditor/StepThree';
import StepTwo from 'components/RosettaStone/RosettaTemplateEditor/StepTwo';
import useNewStatementType from 'components/RosettaStone/RosettaTemplateEditor/hooks/useNewStatementType';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { ReactElement, FC } from 'react';
import { Button, Progress } from 'reactstrap';

type RosettaTemplateEditorProps = {
    saveButtonText: string;
    onCancel?: () => void;
    onCreate?: (template: string) => void;
};

const RosettaTemplateEditor: FC<RosettaTemplateEditorProps> = ({ saveButtonText, onCancel, onCreate }) => {
    const { step, isSaving } = useRosettaTemplateEditorState();

    const { handleAddStatementType } = useNewStatementType();

    const dispatch = useRosettaTemplateEditorDispatch();

    const handleNext = async () => {
        if (step === 3) {
            const templateID = await handleAddStatementType();
            if (templateID) {
                onCreate?.(templateID);
                dispatch({ type: 'initState', payload: null });
            }
        } else {
            dispatch({ type: 'setStep', payload: step !== 3 ? step + 1 : 1 });
        }
    };

    const handlePrevious = () => {
        dispatch({ type: 'setStep', payload: step !== 1 ? step - 1 : 1 });
    };

    const MAP_STEPS: { [key: number]: ReactElement } = { 1: <StepOne />, 2: <StepTwo />, 3: <StepThree /> };

    return (
        <div>
            <Progress className="my-2" striped value={step * 25} />
            <hr />
            {step === 3 && (
                <>
                    <StatementPlaceholder />
                    <hr />
                </>
            )}
            {MAP_STEPS[step]}
            <hr />
            <div className="mt-2 d-flex justify-content-end">
                <Button className="me-2" disabled={isSaving} color="light" onClick={() => onCancel?.()}>
                    Cancel
                </Button>
                <Button className="me-2" disabled={isSaving || step === 1} color="secondary" onClick={handlePrevious}>
                    Previous
                </Button>
                <Button disabled={isSaving} color="primary" onClick={handleNext}>
                    {step !== 3 ? 'Next' : saveButtonText}
                </Button>
            </div>
        </div>
    );
};
export default RosettaTemplateEditor;
