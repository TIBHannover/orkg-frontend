import { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Col from '@/components/Ui/Structure/Col';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { PropertyShape as PropertyShapeType, PropertyShapeNumberType } from '@/services/backend/types';
import { updatePropertyShapes } from '@/slices/templateEditorSlice';

type ValidationRulesNumberProps = {
    id: number;
};

const ValidationRulesNumber: FC<ValidationRulesNumberProps> = ({ id }) => {
    const dispatch = useDispatch();
    // @ts-expect-error
    const propertyShape: PropertyShapeNumberType = useSelector((state) => state.templateEditor.properties[id]);
    // @ts-expect-error
    const propertyShapes: PropertyShapeType[] = useSelector((state) => state.templateEditor.properties);
    const { isEditMode } = useIsEditMode();

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValidationRules = { [e.target.name]: e.target.value };
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            if (j === id) {
                return { ...item, ...newValidationRules };
            }
            return item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    return (
        <div className="mt-2">
            <FormGroup row>
                <Label className="text-end text-muted" for="minInclusiveInput" sm={3}>
                    <small>Minimum value</small>
                </Label>
                <Col sm={9}>
                    <Input
                        disabled={!isEditMode}
                        onChange={onChange}
                        bsSize="sm"
                        type="text"
                        value={propertyShape.min_inclusive}
                        name="min_inclusive"
                        id="minInclusiveInput"
                        placeholder="Specify the minimum value"
                        maxLength={MAX_LENGTH_INPUT}
                    />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label className="text-end text-muted" for="maxInclusiveInput" sm={3}>
                    <small>Maximum value</small>
                </Label>
                <Col sm={9}>
                    <Input
                        disabled={!isEditMode}
                        onChange={onChange}
                        bsSize="sm"
                        value={propertyShape.max_inclusive}
                        type="text"
                        name="max_inclusive"
                        id="maxInclusiveInput"
                        placeholder="Specify the maximum value"
                        maxLength={MAX_LENGTH_INPUT}
                    />
                </Col>
            </FormGroup>
        </div>
    );
};

export default ValidationRulesNumber;
