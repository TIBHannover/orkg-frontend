import HelpIcon from '@/components/RosettaStone/RosettaTemplateEditor/HelpIcon/HelpIcon';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';

function StepTwo() {
    const { description, numberLockedProperties } = useRosettaTemplateEditorState();
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <div>
            <FormGroup className="mt-2">
                <Label for="description">
                    Description of the new statement template{' '}
                    <HelpIcon content="Defining a new statement template includes the definition of a corresponding statement class in the ORKG. This class needs a description or definition that characterizes all statements belonging to that class. Could you please provide such a description for your statement template. For the measurement statement, the description could be: 'The measurement statement covers all kinds of statements in which a specific quality of a given object has been measured, resullting in a vlue and a possible unit. The measurement may also include the specification of a confidence interval, with an upper and a lower value and a confidence level (in %).'" />
                </Label>
                <Input
                    disabled={numberLockedProperties > 0}
                    onChange={(e) => dispatch({ type: 'setDescription', payload: e.target.value })}
                    value={description}
                    type="textarea"
                    id="description"
                    placeholder="Give a description of the template of statement you want to add. What kind of statement template will it cover?"
                    rows="4"
                />
            </FormGroup>
        </div>
    );
}

export default StepTwo;
