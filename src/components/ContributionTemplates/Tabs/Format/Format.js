import React from 'react';
import { FormGroup, Label, FormText, Input, CustomInput, Table } from 'reactstrap';
import { setHasLabelFormat, setLabelFormat } from 'actions/addTemplate';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

function Format(props) {
    const handleChangeLabelFormat = event => {
        props.setLabelFormat(event.target.value);
    };

    const handleSwitchHasLabelFormat = event => {
        props.setHasLabelFormat(event.target.checked);
    };

    return (
        <div className="p-4">
            <FormGroup>
                <div>
                    <CustomInput
                        onChange={handleSwitchHasLabelFormat}
                        checked={props.hasLabelFormat}
                        id="switchHasLabelFormat"
                        type="switch"
                        name="customSwitch"
                        label="Show formatted text instead of resource label"
                        disabled={!props.editMode}
                    />
                </div>
                {props.hasLabelFormat && props.components && props.components.length > 0 && (
                    <div className="mt-3">
                        <FormGroup className="mb-4">
                            <Label>Formatted label</Label>
                            <Input
                                placeholder={'{P123} to {P456}'}
                                value={props.labelFormat}
                                onChange={handleChangeLabelFormat}
                                disabled={!props.editMode}
                            />
                            <FormText>
                                Use the reference of property IDs bellow to get each property placeholder.
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
                                {props.components.map((component, index) => (
                                    <tr key={`row${index}`}>
                                        <th scope="row">{component.property.id}</th>
                                        <td style={{}}>{component.property.label.charAt(0).toUpperCase() + component.property.label.slice(1)}</td>
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
    setHasLabelFormat: PropTypes.func.isRequired,
    setLabelFormat: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    labelFormat: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return {
        editMode: state.addTemplate.editMode,
        hasLabelFormat: state.addTemplate.hasLabelFormat,
        components: state.addTemplate.components,
        labelFormat: state.addTemplate.labelFormat
    };
};

const mapDispatchToProps = dispatch => ({
    setHasLabelFormat: data => dispatch(setHasLabelFormat(data)),
    setLabelFormat: data => dispatch(setLabelFormat(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Format);
