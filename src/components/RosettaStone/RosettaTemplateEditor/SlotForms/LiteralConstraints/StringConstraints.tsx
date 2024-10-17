import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { FC } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import { PropertyShapeStringType } from 'services/backend/types';

type ValidationRulesNumberProps = {
    index: number;
    isLocked?: boolean;
};

const StringConstraints: FC<ValidationRulesNumberProps> = ({ index, isLocked }) => {
    const { properties } = useRosettaTemplateEditorState();
    const slot = (properties[index] as PropertyShapeStringType) ?? {};
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <div className="mt-2">
            <FormGroup className="mt-2">
                <Label for={`patternInput${index}`}>Pattern</Label>
                <Input
                    disabled={isLocked}
                    onChange={(e) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, pattern: e.target.value } } })}
                    type="text"
                    value={slot.pattern}
                    name="pattern"
                    id={`patternInput${index}`}
                    placeholder="Enter a regular expression"
                    maxLength={MAX_LENGTH_INPUT}
                />
            </FormGroup>
        </div>
    );
};

export default StringConstraints;
