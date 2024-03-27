import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import ValidationRules from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/ValidationRules/ValidationRules';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import DATA_TYPES from 'constants/DataTypes.js';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, FormGroup, FormText, Input, InputGroup, Label } from 'reactstrap';
import { updatePropertyShapes } from 'slices/templateEditorSlice';

const TemplateComponentValue = (props) => {
    const propertyShape = useSelector((state) => state.templateEditor.propertyShapes[props.id]);
    const strCardinality = `${propertyShape.minCount || '*'},${propertyShape.maxCount || '*'}`;
    const mapOptions = {
        '*,*': '0,*',
        '0,*': '0,*',
        '0,1': '0,1',
        '1,1': '1,1',
        '1,*': '1,*',
    };
    const [cardinality, setCardinality] = useState(mapOptions[strCardinality] || 'range');
    const classAutocompleteRef = useRef(null);
    const { isEditMode } = useIsEditMode();

    const dispatch = useDispatch();
    const propertyShapes = useSelector((state) => state.templateEditor.propertyShapes);

    const onChange = (event) => {
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            const _item = { ...item };
            if (j === props.id) {
                _item[event.target.name] = event.target.value.toString();
            }
            return _item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    const onChangeCardinality = (event) => {
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
                        placeholder={isEditMode ? 'Select or type to enter a class' : 'No Class'}
                        onChange={(selected, action) => {
                            // blur the field allows to focus and open the menu again
                            classAutocompleteRef.current && classAutocompleteRef.current.blur();
                            props.handleClassOfPropertySelect(selected, action, props.id);
                        }}
                        value={propertyShape.value}
                        autoLoadOption={true}
                        openMenuOnFocus={true}
                        allowCreate={true}
                        isDisabled={!isEditMode}
                        copyValueButton={true}
                        isClearable
                        defaultOptions={DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE).map((dt) => ({ label: dt.name, id: dt.classId }))}
                        innerRef={classAutocompleteRef}
                        linkButton={propertyShape.value && propertyShape.value.id ? reverse(ROUTES.CLASS, { id: propertyShape.value.id }) : ''}
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
                                disabled={!isEditMode}
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
                                        disabled={!isEditMode}
                                        onChange={onChange}
                                        bsSize="sm"
                                        value={propertyShape.minCount}
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
                                        disabled={!isEditMode}
                                        onChange={onChange}
                                        bsSize="sm"
                                        value={propertyShape.maxCount !== null ? propertyShape.maxCount : ''}
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="maxCount"
                                        id="maxCountValueInput"
                                        placeholder="Maximum number of occurrences in the resource"
                                    />
                                    {isEditMode && (
                                        <FormText className="d-block">Clear the input field if there is no restriction (unbounded)</FormText>
                                    )}
                                </Col>
                            </FormGroup>
                        </div>
                    </>
                )}
                <FormGroup row>
                    <Label className="text-end text-muted" for="placeholderInput" sm={3}>
                        <small>Placeholder</small>
                    </Label>
                    <Col sm={9}>
                        <Input
                            disabled={!isEditMode}
                            onChange={onChange}
                            bsSize="sm"
                            value={propertyShape.placeholder}
                            type="text"
                            name="placeholder"
                            id="placeholderInput"
                            placeholder="Enter a placeholder for the input form"
                        />
                    </Col>
                </FormGroup>

                <FormGroup row>
                    <Label className="text-end text-muted" for="descriptionInput" sm={3}>
                        <small>Description</small>
                    </Label>
                    <Col sm={9}>
                        <Input
                            disabled={!isEditMode}
                            onChange={onChange}
                            bsSize="sm"
                            value={propertyShape.description}
                            type="textarea"
                            name="description"
                            id="descriptionInput"
                            placeholder="Enter a description for the input form"
                        />
                    </Col>
                </FormGroup>

                {propertyShape.value && ['Decimal', 'Integer', 'String'].includes(propertyShape.value.id) && (
                    <ValidationRules
                        minInclusive={propertyShape.minInclusive}
                        maxInclusive={propertyShape.maxInclusive}
                        pattern={propertyShape.pattern}
                        id={props.id}
                        value={propertyShape.value}
                    />
                )}
            </div>
        </ValuesStyle>
    );
};

TemplateComponentValue.propTypes = {
    id: PropTypes.number.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired,
};

export default TemplateComponentValue;
