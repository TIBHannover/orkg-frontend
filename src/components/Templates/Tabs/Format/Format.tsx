import { ChangeEvent, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FormGroup from '@/components/Ui/Form/FormGroup';
import FormText from '@/components/Ui/Form/FormText';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Table from '@/components/Ui/Table/Table';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShape } from '@/services/backend/types';
import { updateHasLabelFormat, updateLabelFormat } from '@/slices/templateEditorSlice';

const Format: FC<{}> = () => {
    const dispatch = useDispatch();

    // @ts-expect-error
    const propertyShapes = useSelector((state) => state.templateEditor.properties);
    // @ts-expect-error
    const hasLabelFormat = useSelector((state) => state.templateEditor.hasLabelFormat);
    // @ts-expect-error
    const formattedLabel = useSelector((state) => state.templateEditor.formatted_label);
    const { isEditMode } = useIsEditMode();

    const handleChangeLabelFormat = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updateLabelFormat(e.target.value));
    };

    const handleSwitchHasLabelFormat = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updateHasLabelFormat(e.target.checked));
    };

    return (
        <div className="p-4">
            <FormGroup>
                <div>
                    <Input
                        onChange={handleSwitchHasLabelFormat}
                        checked={hasLabelFormat}
                        id="switchHasLabelFormat"
                        type="switch"
                        disabled={!isEditMode}
                    />{' '}
                    <Label for="switchHasLabelFormat" className="mb-0">
                        Show formatted text instead of resource label
                    </Label>
                </div>
                {hasLabelFormat && propertyShapes?.length > 0 && (
                    <div className="mt-3">
                        <FormGroup className="mb-4">
                            <Label for="formatted-label">Formatted label</Label>
                            <Input
                                placeholder="{P123} to {P456}"
                                value={formattedLabel}
                                onChange={handleChangeLabelFormat}
                                disabled={!isEditMode}
                                id="formatted-label"
                            />
                            <FormText>
                                Use the reference of property IDs below to get each property placeholder.
                                <br />
                                The formatted text result will replace each {'{P…}'} placeholder in the string with its corresponding value.
                                <br />
                                e.g:{' '}
                                <i>
                                    {'{P123}'} to {'{P456}'}
                                </i>{' '}
                                will give the result <i>value123 to value456</i>
                            </FormText>
                        </FormGroup>
                        <Table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Placeholder</th>
                                    <th>Property</th>
                                </tr>
                            </thead>
                            <tbody>
                                {propertyShapes.map((propertyShape: PropertyShape) => (
                                    <tr key={`row${propertyShape.path?.id}`}>
                                        <th scope="row">{propertyShape.path?.id}</th>
                                        <td>{propertyShape.placeholder}</td>
                                        <td>{propertyShape.path?.label}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
                {hasLabelFormat && propertyShapes?.length === 0 && (
                    <div className="mt-3 text-primary">Please add some properties first to use this feature.</div>
                )}
            </FormGroup>
        </div>
    );
};

export default Format;
