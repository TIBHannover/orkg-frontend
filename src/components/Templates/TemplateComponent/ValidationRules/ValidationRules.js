import { FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import { updateComponents } from 'slices/templateEditorSlice';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

function ValidationRules(props) {
    const onChange = event => {
        const newValidationRules = { ...props.validationRules, [event.target.name]: event.target.value };
        const templateComponents = props.components.map((item, j) => {
            if (j === props.id) {
                item.validationRules = newValidationRules;
            }
            return item;
        });
        props.updateComponents(templateComponents);
    };

    return (
        <div className="mt-2">
            {props.value && props.value.id === 'String' && (
                <>
                    <FormGroup row>
                        <Label className="text-end text-muted" for="patternInput" sm={3}>
                            <small>Pattern</small>
                        </Label>
                        <Col sm={9}>
                            <Input
                                disabled={!props.enableEdit}
                                bsSize="sm"
                                type="text"
                                name="pattern"
                                id="patternInput"
                                value={props.validationRules['pattern']}
                                placeholder="Enter a regular expression"
                                onChange={onChange}
                            />
                            <FormText>It must begin with ^ and end with $.</FormText>
                        </Col>
                    </FormGroup>
                </>
            )}
            {props.value && (props.value.id === 'Number' || props.value.id === 'Integer') && (
                <>
                    <FormGroup row>
                        <Label className="text-end text-muted" for="minimumValueInput" sm={3}>
                            <small>Minimum value</small>
                        </Label>
                        <Col sm={9}>
                            <Input
                                disabled={!props.enableEdit}
                                onChange={onChange}
                                bsSize="sm"
                                type="text"
                                value={props.validationRules['min']}
                                name="min"
                                id="minimumValueInput"
                                placeholder="Specify the minimum value"
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label className="text-end text-muted" for="maximumValueInput" sm={3}>
                            <small>Maximum value</small>
                        </Label>
                        <Col sm={9}>
                            <Input
                                disabled={!props.enableEdit}
                                onChange={onChange}
                                bsSize="sm"
                                value={props.validationRules['max']}
                                type="text"
                                name="max"
                                id="maximumValueInput"
                                placeholder="Specify the maximum value"
                            />
                        </Col>
                    </FormGroup>
                </>
            )}
        </div>
    );
}

ValidationRules.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.object.isRequired,
    validationRules: PropTypes.object,
    enableEdit: PropTypes.bool.isRequired,
    components: PropTypes.array.isRequired,
    updateComponents: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        components: state.templateEditor.components,
        editMode: state.templateEditor.editMode
    };
};

const mapDispatchToProps = dispatch => ({
    updateComponents: data => dispatch(updateComponents(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ValidationRules);
