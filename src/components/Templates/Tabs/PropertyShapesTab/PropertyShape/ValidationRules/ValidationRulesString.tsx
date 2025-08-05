import { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FormGroup from '@/components/Ui/Form/FormGroup';
import FormText from '@/components/Ui/Form/FormText';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Col from '@/components/Ui/Structure/Col';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShape as PropertyShapeType, PropertyShapeStringType } from '@/services/backend/types';
import { updatePropertyShapes } from '@/slices/templateEditorSlice';

type ValidationRulesStringProps = {
    id: number;
};

const ValidationRulesString: FC<ValidationRulesStringProps> = ({ id }) => {
    const dispatch = useDispatch();
    // @ts-expect-error
    const propertyShape: PropertyShapeStringType = useSelector((state) => state.templateEditor.properties[id]);
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
                <Label className="text-end text-muted" for="patternInput" sm={3}>
                    <small>Pattern</small>
                </Label>
                <Col sm={9}>
                    <Input
                        disabled={!isEditMode}
                        bsSize="sm"
                        type="text"
                        name="pattern"
                        id="patternInput"
                        value={propertyShape.pattern}
                        placeholder="Enter a regular expression"
                        onChange={onChange}
                    />
                    <FormText>It must begin with ^ and end with $.</FormText>
                </Col>
            </FormGroup>
        </div>
    );
};

export default ValidationRulesString;
