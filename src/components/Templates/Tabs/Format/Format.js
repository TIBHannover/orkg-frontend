import { FormGroup, Label, FormText, Input, Table } from 'reactstrap';
import { updateHasLabelFormat, updateLabelFormat } from 'slices/templateEditorSlice';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

function Format(props) {
    const handleChangeLabelFormat = event => {
        props.updateLabelFormat(event.target.value);
    };

    const handleSwitchHasLabelFormat = event => {
        props.updateHasLabelFormat(event.target.checked);
    };

    return (
        <div className="p-4">
            <FormGroup>
                <div>
                    <Input
                        onChange={handleSwitchHasLabelFormat}
                        checked={props.hasLabelFormat}
                        id="switchHasLabelFormat"
                        type="switch"
                        name="customSwitch"
                        disabled={!props.editMode}
                    />{' '}
                    <Label for="switchHasLabelFormat" className="mb-0">
                        Show formatted text instead of resource label
                    </Label>
                </div>
                {props.hasLabelFormat && props.components && props.components.length > 0 && (
                    <div className="mt-3">
                        <FormGroup className="mb-4">
                            <Label>Formatted label</Label>
                            <Input
                                placeholder="{P123} to {P456}"
                                value={props.labelFormat}
                                onChange={handleChangeLabelFormat}
                                disabled={!props.editMode}
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
                                    <th>Property</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.components.map(component => (
                                    <tr key={`row${component.property.id}`}>
                                        <th scope="row">{component.property.id}</th>
                                        <td style={{}}>{component.property.label}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
                {props.hasLabelFormat && props.components && props.components.length === 0 && (
                    <div className="mt-3 text-primary">Please add some properties first to use this feature.</div>
                )}
            </FormGroup>
        </div>
    );
}

Format.propTypes = {
    editMode: PropTypes.bool.isRequired,
    hasLabelFormat: PropTypes.bool.isRequired,
    updateHasLabelFormat: PropTypes.func.isRequired,
    updateLabelFormat: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    labelFormat: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return {
        editMode: state.templateEditor.editMode,
        hasLabelFormat: state.templateEditor.hasLabelFormat,
        components: state.templateEditor.components,
        labelFormat: state.templateEditor.labelFormat
    };
};

const mapDispatchToProps = dispatch => ({
    updateHasLabelFormat: data => dispatch(updateHasLabelFormat(data)),
    updateLabelFormat: data => dispatch(updateLabelFormat(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Format);
