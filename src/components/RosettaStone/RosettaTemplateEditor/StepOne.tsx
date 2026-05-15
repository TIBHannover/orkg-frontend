import { Input, Label, TextField } from '@heroui/react';

import HelpIcon from '@/components/RosettaStone/RosettaTemplateEditor/HelpIcon/HelpIcon';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';

function StepOne() {
    const { label, numberLockedProperties } = useRosettaTemplateEditorState();
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <div className="flex flex-col gap-3">
            <p className="text-foreground">
                In the following steps, we will guide you through defining a statement template that is not covered by the ORKG yet.
            </p>
            {numberLockedProperties > 0 && (
                <p className="text-sm text-muted">
                    <b>Note:</b> You can edit the label and the description only if the statement template has not been used yet.
                </p>
            )}
            <TextField
                fullWidth
                isDisabled={numberLockedProperties > 0}
                value={label}
                onChange={(value) => dispatch({ type: 'setLabel', payload: value })}
            >
                <Label className="inline-flex items-center gap-2">
                    What is the label of the new statement template?
                    <HelpIcon content="Please provide a label for the new statement template that characterizes the template and makes it easy to find for users wanting to add this template. In many cases, this label can refer to the main verb or predicate of the statement (e.g. 'has part statement template'), but sometimes it generalizes from the predicate (e.g. 'has measurement statement template')" />
                </Label>
                <Input id="label" placeholder="Predicate or verb statement template" />
            </TextField>
        </div>
    );
}

export default StepOne;
