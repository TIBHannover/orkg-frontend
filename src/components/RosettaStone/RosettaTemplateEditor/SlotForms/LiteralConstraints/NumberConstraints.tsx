import { Input, Label, TextField } from '@heroui/react';
import { FC } from 'react';

import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { PropertyShapeNumberType } from '@/services/backend/types';

type ValidationRulesNumberProps = {
    index: number;
    isLocked?: boolean;
};

const NumberConstraints: FC<ValidationRulesNumberProps> = ({ index, isLocked }) => {
    const { properties } = useRosettaTemplateEditorState();
    const slot = (properties[index] as PropertyShapeNumberType) ?? {};
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <div className="flex flex-col gap-4">
            <TextField
                fullWidth
                isDisabled={isLocked}
                value={slot.min_inclusive?.toString() ?? ''}
                onChange={(value) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, min_inclusive: parseFloat(value) } } })}
            >
                <Label>Minimum value</Label>
                <Input
                    type="number"
                    name="min_inclusive"
                    id={`minInclusiveInput${index}`}
                    placeholder="Specify the minimum value"
                    maxLength={MAX_LENGTH_INPUT}
                />
            </TextField>
            <TextField
                fullWidth
                isDisabled={isLocked}
                value={slot.max_inclusive?.toString() ?? ''}
                onChange={(value) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, max_inclusive: parseFloat(value) } } })}
            >
                <Label>Maximum value</Label>
                <Input
                    type="number"
                    name="max_inclusive"
                    id={`maxInclusiveInput${index}`}
                    placeholder="Specify the maximum value"
                    maxLength={MAX_LENGTH_INPUT}
                />
            </TextField>
        </div>
    );
};

export default NumberConstraints;
