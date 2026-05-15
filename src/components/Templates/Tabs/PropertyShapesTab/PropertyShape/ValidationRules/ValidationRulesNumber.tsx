import { Input, Label, TextField } from '@heroui/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { PropertyShapeNumberType } from '@/services/backend/types';
import { updatePropertyShapes } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';

type ValidationRulesNumberProps = {
    id: number;
};

const ValidationRulesNumber: FC<ValidationRulesNumberProps> = ({ id }) => {
    const dispatch = useDispatch();
    const propertyShape = useSelector((state: RootStore) => state.templateEditor.properties[id]) as PropertyShapeNumberType;
    const propertyShapes = useSelector((state: RootStore) => state.templateEditor.properties);
    const { isEditMode } = useIsEditMode();

    const updateField = (name: 'min_inclusive' | 'max_inclusive', value: string) => {
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            if (j === id) {
                return { ...item, [name]: value };
            }
            return item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    return (
        <div className="flex flex-col gap-2 mt-1">
            <div className="grid grid-cols-12 items-center gap-2">
                <Label htmlFor="minInclusiveInput" className="col-span-12 md:col-span-3 text-muted text-sm md:text-right">
                    Minimum value
                </Label>
                <div className="col-span-12 md:col-span-9">
                    <TextField
                        fullWidth
                        value={
                            propertyShape.min_inclusive !== undefined && propertyShape.min_inclusive !== null
                                ? String(propertyShape.min_inclusive)
                                : ''
                        }
                        onChange={(value) => updateField('min_inclusive', value)}
                        isDisabled={!isEditMode}
                        aria-label="Minimum value"
                    >
                        <Input
                            id="minInclusiveInput"
                            placeholder="Specify the minimum value"
                            maxLength={MAX_LENGTH_INPUT}
                            className="!border !border-border focus:!border-accent"
                        />
                    </TextField>
                </div>
            </div>
            <div className="grid grid-cols-12 items-center gap-2">
                <Label htmlFor="maxInclusiveInput" className="col-span-12 md:col-span-3 text-muted text-sm md:text-right">
                    Maximum value
                </Label>
                <div className="col-span-12 md:col-span-9">
                    <TextField
                        fullWidth
                        value={
                            propertyShape.max_inclusive !== undefined && propertyShape.max_inclusive !== null
                                ? String(propertyShape.max_inclusive)
                                : ''
                        }
                        onChange={(value) => updateField('max_inclusive', value)}
                        isDisabled={!isEditMode}
                        aria-label="Maximum value"
                    >
                        <Input
                            id="maxInclusiveInput"
                            placeholder="Specify the maximum value"
                            maxLength={MAX_LENGTH_INPUT}
                            className="!border !border-border focus:!border-accent"
                        />
                    </TextField>
                </div>
            </div>
        </div>
    );
};

export default ValidationRulesNumber;
