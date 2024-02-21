import { FormGroup, Label, FormText, Input, Table } from 'reactstrap';
import { updateHasLabelFormat, updateLabelFormat } from 'slices/templateEditorSlice';
import { useSelector, useDispatch } from 'react-redux';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';

const Format = () => {
    const dispatch = useDispatch();
    const propertyShapes = useSelector(state => state.templateEditor.propertyShapes);
    const hasLabelFormat = useSelector(state => state.templateEditor.hasLabelFormat);
    const labelFormat = useSelector(state => state.templateEditor.labelFormat);
    const { isEditMode } = useIsEditMode();
    const handleChangeLabelFormat = event => {
        dispatch(updateLabelFormat(event.target.value));
    };

    const handleSwitchHasLabelFormat = event => {
        dispatch(updateHasLabelFormat(event.target.checked));
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
                        name="customSwitch"
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
                                value={labelFormat}
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
                                {propertyShapes.map(propertyShape => (
                                    <tr key={`row${propertyShape.property.id}`}>
                                        <th scope="row">{propertyShape.property.id}</th>
                                        <td style={{}}>{propertyShape.placeholder}</td>
                                        <td style={{}}>{propertyShape.property.label}</td>
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
