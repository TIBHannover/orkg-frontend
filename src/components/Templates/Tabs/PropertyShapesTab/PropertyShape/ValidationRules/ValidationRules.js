import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Col, FormGroup, FormText, Input, Label } from 'reactstrap';
import { updatePropertyShapes } from 'slices/templateEditorSlice';

const ValidationRules = ({ id, value, minInclusive, maxInclusive, pattern }) => {
    const dispatch = useDispatch();
    const propertyShapes = useSelector(state => state.templateEditor.propertyShapes);
    const { isEditMode } = useIsEditMode();

    const onChange = event => {
        const newValidationRules = { minInclusive, maxInclusive, pattern, [event.target.name]: event.target.value };
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            if (j === id) {
                item = { ...item, ...newValidationRules };
            }
            return item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    return (
        <div className="mt-2">
            {value && value.id === 'String' && (
                <>
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
                                value={pattern}
                                placeholder="Enter a regular expression"
                                onChange={onChange}
                            />
                            <FormText>It must begin with ^ and end with $.</FormText>
                        </Col>
                    </FormGroup>
                </>
            )}
            {value && (value.id === 'Decimal' || value.id === 'Integer') && (
                <>
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
                                value={minInclusive}
                                name="minInclusive"
                                id="minInclusiveInput"
                                placeholder="Specify the minimum value"
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
                                value={maxInclusive}
                                type="text"
                                name="maxInclusive"
                                id="maxInclusiveInput"
                                placeholder="Specify the maximum value"
                            />
                        </Col>
                    </FormGroup>
                </>
            )}
        </div>
    );
};

ValidationRules.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.object.isRequired,
    minInclusive: PropTypes.string,
    maxInclusive: PropTypes.string,
    pattern: PropTypes.string,
};

export default ValidationRules;
