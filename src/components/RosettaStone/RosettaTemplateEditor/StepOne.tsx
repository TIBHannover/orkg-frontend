import HelpIcon from '@/components/RosettaStone/RosettaTemplateEditor/HelpIcon/HelpIcon';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';

function StepOne() {
    const { label, numberLockedProperties } = useRosettaTemplateEditorState();
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <div>
            <p>In the following steps, we will guide you through defining a statement template that is not covered by the ORKG yet. </p>
            {numberLockedProperties > 0 && (
                <p>
                    <b>Note:</b> You can edit the label and the description only if the statement template has not been used yet.
                </p>
            )}
            <FormGroup className="mt-2">
                <Label for="label">
                    What is the label of the new statement template?{' '}
                    <HelpIcon content="Please provide a label for the new statement template that characterizes the template and makes it easy to find for users wanting to add this template. In many cases, this label can refer to the main verb or predicate of the statement (e.g. 'has part statement template'), but sometimes it generalizes from the predicate (e.g. 'has measurement statement template')" />
                </Label>
                <Input
                    disabled={numberLockedProperties > 0}
                    onChange={(e) => dispatch({ type: 'setLabel', payload: e.target.value })}
                    value={label}
                    type="text"
                    id="label"
                    placeholder="Predicate or verb statement template"
                />
            </FormGroup>
        </div>
    );
}

export default StepOne;
