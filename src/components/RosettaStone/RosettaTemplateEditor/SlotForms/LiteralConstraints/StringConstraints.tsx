import { Input, Label, TextField } from '@heroui/react';
import { FC } from 'react';

import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { PropertyShapeStringType } from '@/services/backend/types';

type ValidationRulesNumberProps = {
    index: number;
    isLocked?: boolean;
};

const StringConstraints: FC<ValidationRulesNumberProps> = ({ index, isLocked }) => {
    const { properties } = useRosettaTemplateEditorState();
    const slot = (properties[index] as PropertyShapeStringType) ?? {};
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <TextField
            fullWidth
            isDisabled={isLocked}
            value={slot.pattern ?? ''}
            onChange={(value) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, pattern: value } } })}
        >
            <Label>Pattern</Label>
            <Input type="text" name="pattern" id={`patternInput${index}`} placeholder="Enter a regular expression" maxLength={MAX_LENGTH_INPUT} />
        </TextField>
    );
};

export default StringConstraints;
