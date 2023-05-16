import { useState, useRef } from 'react';
import { InputGroup, FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import DATA_TYPES from 'constants/DataTypes.js';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { updatePropertyShapes } from 'slices/templateEditorSlice';
import { useSelector, useDispatch } from 'react-redux';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import ValidationRules from '../ValidationRules/ValidationRules';

const TemplateComponentValue = props => {
    const [cardinality, setCardinality] = useState(!props.minCount && !props.maxCount ? '0,*' : 'range');
    const classAutocompleteRef = useRef(null);

    const dispatch = useDispatch();
    const propertyShapes = useSelector(state => state.templateEditor.propertyShapes);
    const editMode = useSelector(state => state.templateEditor.editMode);

    const onChange = event => {
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            const _item = { ...item };
            if (j === props.id) {
                _item[event.target.name] = event.target.value.toString();
            }
            return _item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    const onChangeCardinality = event => {
        setCardinality(event.target.value);

        if (event.target.value !== 'range') {
            const [minCount, maxCount] = event.target.value.split(',');
            const templatePropertyShapes = propertyShapes.map((item, j) => {
                const _item = { ...item };
                if (j === props.id) {
                    _item.minCount = minCount;
                    _item.maxCount = maxCount !== '*' ? maxCount : '';
                }
                return _item;
            });
            dispatch(updatePropertyShapes(templatePropertyShapes));
        }
    };

    return (
        <ValuesStyle className="col-8 valuesList">
            <div>
                <InputGroup size="sm">
                    <AutoComplete
                        entityType={ENTITIES.CLASS}
                        placeholder={editMode ? 'Select or type to enter a class' : 'No Class'}
                        onChange={(selected, action) => {
                            // blur the field allows to focus and open the menu again
                            classAutocompleteRef.current && classAutocompleteRef.current.blur();
                            props.handleClassOfPropertySelect(selected, action, props.id);
                        }}
                        value={props.value}
                        autoLoadOption={true}
                        openMenuOnFocus={true}
                        allowCreate={true}
                        isDisabled={!editMode}
                        copyValueButton={true}
                        isClearable
                        defaultOptions={DATA_TYPES.filter(dt => dt.classId !== CLASSES.RESOURCE).map(dt => ({ label: dt.name, id: dt.classId }))}
                        innerRef={classAutocompleteRef}
                        linkButton={props.value && props.value.id ? reverse(ROUTES.CLASS, { id: props.value.id }) : ''}
                        linkButtonTippy="Go to class page"
                        cssClasses="form-control-sm"
                        autoFocus={false}
                        ols={true}
                    />
                </InputGroup>
                <div className="mt-2">
                    <FormGroup row>
                        <Label className="text-end text-muted" for="cardinalityValueInput" sm={3}>
                            <small>Cardinality</small>
                        </Label>
                        <Col sm={9}>
                            <Input
                                disabled={!editMode}
                                onChange={onChangeCardinality}
                                value={cardinality}
                                type="select"
                                bsSize="sm"
                                id="cardinalityValueInput"
                            >
                                <option value="0,*">Zero or more [0,*]</option>
                                <option value="0,1">Optional [0,1]</option>
                                <option value="1,1">Exactly one [1,1]</option>
                                <option value="1,*">One or more [1,*]</option>
                                <option value="range">Custom...</option>
                            </Input>
                        </Col>
                    </FormGroup>
                </div>
                {cardinality === 'range' && (
                    <>
                        <div className="mt-2">
                            <FormGroup row>
                                <Label className="text-end text-muted" for="minCountValueInput" sm={3}>
                                    <small>Minimum Occurence</small>
                                </Label>
                                <Col sm={9}>
                                    <Input
                                        disabled={!editMode}
                                        onChange={onChange}
                                        bsSize="sm"
                                        value={props.minCount}
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="minCount"
                                        id="minCountValueInput"
                                        placeholder="Minimum number of occurrences in the resource"
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className="text-end text-muted" for="maxCountValueInput" sm={3}>
                                    <small>Maximum Occurence</small>
                                </Label>
                                <Col sm={9}>
                                    <Input
                                        disabled={!editMode}
                                        onChange={onChange}
                                        bsSize="sm"
                                        value={props.maxCount !== null ? props.maxCount : ''}
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="maxCount"
                                        id="maxCountValueInput"
                                        placeholder="Maximum number of occurrences in the resource"
                                    />
                                    {editMode && (
                                        <FormText className="d-block">Clear the input field if there is no restriction (unbounded)</FormText>
                                    )}
                                </Col>
                            </FormGroup>
                        </div>
                    </>
                )}

                {props.value && ['Decimal', 'Integer', 'String'].includes(props.value.id) && (
                    <ValidationRules
                        minInclusive={props.minInclusive}
                        maxInclusive={props.maxInclusive}
                        pattern={props.pattern}
                        id={props.id}
                        value={props.value}
                    />
                )}
            </div>
        </ValuesStyle>
    );
};

TemplateComponentValue.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.object,
    minCount: PropTypes.string.isRequired,
    maxCount: PropTypes.string,
    minInclusive: PropTypes.string,
    maxInclusive: PropTypes.string,
    pattern: PropTypes.string,
    handleClassOfPropertySelect: PropTypes.func.isRequired,
};

export default TemplateComponentValue;
