import { Input, Label, TextField } from '@heroui/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShapeStringType } from '@/services/backend/types';
import { updatePropertyShapes } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';

type ValidationRulesStringProps = {
    id: number;
};

const ValidationRulesString: FC<ValidationRulesStringProps> = ({ id }) => {
    const dispatch = useDispatch();
    const propertyShape = useSelector((state: RootStore) => state.templateEditor.properties[id]) as PropertyShapeStringType;
    const propertyShapes = useSelector((state: RootStore) => state.templateEditor.properties);
    const { isEditMode } = useIsEditMode();

    const handlePatternChange = (value: string) => {
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            if (j === id) {
                return { ...item, pattern: value };
            }
            return item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    return (
        <div className="grid grid-cols-12 items-start gap-2 mt-1">
            <Label htmlFor="patternInput" className="col-span-12 md:col-span-3 text-muted text-sm md:text-right md:pt-2">
                Pattern
            </Label>
            <div className="col-span-12 md:col-span-9">
                <TextField
                    fullWidth
                    value={propertyShape.pattern || ''}
                    onChange={handlePatternChange}
                    isDisabled={!isEditMode}
                    aria-label="Regex pattern"
                >
                    <Input id="patternInput" placeholder="Enter a regular expression" className="!border !border-border focus:!border-accent" />
                </TextField>
                <p className="text-muted text-xs mt-1">It must begin with ^ and end with $.</p>
            </div>
        </div>
    );
};

export default ValidationRulesString;
