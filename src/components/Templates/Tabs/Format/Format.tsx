import { Alert, Input, Label, Switch, TextField } from '@heroui/react';
import { useDispatch, useSelector } from 'react-redux';

import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShape } from '@/services/backend/types';
import { updateHasLabelFormat, updateLabelFormat } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';

const Format = () => {
    const dispatch = useDispatch();

    const propertyShapes = useSelector((state: RootStore) => state.templateEditor.properties);
    const hasLabelFormat = useSelector((state: RootStore) => state.templateEditor.hasLabelFormat);
    const formattedLabel = useSelector((state: RootStore) => state.templateEditor.formatted_label);
    const { isEditMode } = useIsEditMode();

    const handleChangeLabelFormat = (value: string) => {
        dispatch(updateLabelFormat(value));
    };

    const handleSwitchHasLabelFormat = (isSelected: boolean) => {
        dispatch(updateHasLabelFormat(isSelected));
    };

    return (
        <div className="p-6">
            <Switch isSelected={hasLabelFormat} onChange={handleSwitchHasLabelFormat} isDisabled={!isEditMode} className="flex items-center gap-3">
                <Switch.Content>
                    <Switch.Control>
                        <Switch.Thumb />
                    </Switch.Control>
                    Show formatted text instead of resource label
                </Switch.Content>
            </Switch>

            {hasLabelFormat && propertyShapes?.length > 0 && (
                <div className="mt-4">
                    <div className="mb-6">
                        <Label htmlFor="formatted-label" className="mb-1 inline-block">
                            Formatted label
                        </Label>
                        <TextField
                            fullWidth
                            value={formattedLabel ?? ''}
                            onChange={handleChangeLabelFormat}
                            isDisabled={!isEditMode}
                            aria-label="Formatted label"
                        >
                            <Input id="formatted-label" placeholder="{P123} to {P456}" className="!border !border-border focus:!border-accent" />
                        </TextField>
                        <p className="text-muted text-sm mt-1">
                            Use the reference of property IDs below to get each property placeholder.
                            <br />
                            The formatted text result will replace each {'{P…}'} placeholder in the string with its corresponding value.
                            <br />
                            e.g:{' '}
                            <i>
                                {'{P123}'} to {'{P456}'}
                            </i>{' '}
                            will give the result <i>value123 to value456</i>
                        </p>
                    </div>
                    <div className="rounded border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-surface-secondary">
                                <tr>
                                    <th className="text-left px-4 py-2 font-semibold">ID</th>
                                    <th className="text-left px-4 py-2 font-semibold">Placeholder</th>
                                    <th className="text-left px-4 py-2 font-semibold">Property</th>
                                </tr>
                            </thead>
                            <tbody>
                                {propertyShapes.map((propertyShape: PropertyShape) => (
                                    <tr key={`row${propertyShape.path?.id}`} className="border-t border-border">
                                        <th scope="row" className="text-left px-4 py-2 font-medium">
                                            {propertyShape.path?.id}
                                        </th>
                                        <td className="px-4 py-2">{propertyShape.placeholder}</td>
                                        <td className="px-4 py-2">{propertyShape.path?.label}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {hasLabelFormat && propertyShapes?.length === 0 && (
                <Alert status="accent" className="mt-4">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Please add some properties first to use this feature.</Alert.Title>
                    </Alert.Content>
                </Alert>
            )}
        </div>
    );
};

export default Format;
