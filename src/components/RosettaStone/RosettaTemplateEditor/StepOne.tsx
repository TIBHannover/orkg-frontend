import HelpIcon from 'components/RosettaStone/RosettaTemplateEditor/HelpIcon/HelpIcon';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { FormGroup, Input, Label } from 'reactstrap';

function StepTwo() {
    const { label } = useRosettaTemplateEditorState();
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <div>
            <p>In the following steps, we will guide you through defining a statement type that is not covered by the ORKG yet. </p>
            <FormGroup className="mt-2">
                <Label for="label">
                    What is the label of new statement type?{' '}
                    <HelpIcon content="Please provide a label for the new statement type that characterizes the type of statement and makes it easy to find for users wanting to add this type of statement. In many cases, this label can refer to the main verb or predicate of the statement (e.g. 'has part statement'), but sometimes it generalizes from the predicate (e.g. 'has measurement statement')" />
                </Label>
                <Input
                    onChange={(e) => dispatch({ type: 'setLabel', payload: e.target.value })}
                    value={label}
                    type="text"
                    id="label"
                    placeholder="Predicate or verb statement type"
                />
            </FormGroup>
        </div>
    );
}

export default StepTwo;
