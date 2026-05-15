import { Label, TextArea, TextField } from '@heroui/react';

import HelpIcon from '@/components/RosettaStone/RosettaTemplateEditor/HelpIcon/HelpIcon';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';

function StepTwo() {
    const { description, numberLockedProperties } = useRosettaTemplateEditorState();
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <TextField
            fullWidth
            isDisabled={numberLockedProperties > 0}
            value={description}
            onChange={(value) => dispatch({ type: 'setDescription', payload: value })}
        >
            <Label className="inline-flex items-center gap-2">
                Description of the new statement template
                <HelpIcon content="Defining a new statement template includes the definition of a corresponding statement class in the ORKG. This class needs a description or definition that characterizes all statements belonging to that class. Could you please provide such a description for your statement template. For the measurement statement, the description could be: 'The measurement statement covers all kinds of statements in which a specific quality of a given object has been measured, resullting in a vlue and a possible unit. The measurement may also include the specification of a confidence interval, with an upper and a lower value and a confidence level (in %).'" />
            </Label>
            <TextArea
                id="description"
                placeholder="Give a description of the template of statement you want to add. What kind of statement template will it cover?"
                rows={4}
            />
        </TextField>
    );
}

export default StepTwo;
