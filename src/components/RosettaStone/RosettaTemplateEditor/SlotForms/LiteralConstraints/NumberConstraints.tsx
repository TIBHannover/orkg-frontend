import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { FC } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import { PropertyShapeNumberType } from 'services/backend/types';

type ValidationRulesNumberProps = {
    index: number;
    isLocked?: boolean;
};

const NumberConstraints: FC<ValidationRulesNumberProps> = ({ index, isLocked }) => {
    const { properties } = useRosettaTemplateEditorState();
    const slot = (properties[index] as PropertyShapeNumberType) ?? {};
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <div className="mt-2">
            <FormGroup className="mt-2">
                <Label for={`minInclusiveInput${index}`}>Minimum value</Label>
                <Input
                    disabled={isLocked}
                    onChange={(e) =>
                        dispatch({ type: 'setProperty', payload: { index, data: { ...slot, min_inclusive: parseFloat(e.target.value) } } })
                    }
                    type="number"
                    value={slot.min_inclusive}
                    name="min_inclusive"
                    id={`minInclusiveInput${index}`}
                    placeholder="Specify the minimum value"
                    maxLength={MAX_LENGTH_INPUT}
                />
            </FormGroup>
            <FormGroup className="mt-2">
                <Label for={`maxInclusiveInput${index}`}>Maximum value</Label>
                <Input
                    disabled={isLocked}
                    onChange={(e) =>
                        dispatch({ type: 'setProperty', payload: { index, data: { ...slot, max_inclusive: parseFloat(e.target.value) } } })
                    }
                    type="number"
                    value={slot.max_inclusive}
                    name="max_inclusive"
                    id={`maxInclusiveInput${index}`}
                    placeholder="Specify the maximum value"
                    maxLength={MAX_LENGTH_INPUT}
                />
            </FormGroup>
        </div>
    );
};

export default NumberConstraints;
