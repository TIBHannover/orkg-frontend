import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import ValidationRulesNumber from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/ValidationRules/ValidationRulesNumber';
import ValidationRulesString from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/ValidationRules/ValidationRulesString';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import DATA_TYPES from 'constants/DataTypes.js';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useRef, useState, FC, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, FormGroup, FormText, Input, InputGroup, Label } from 'reactstrap';
import { updatePropertyShapes } from 'slices/templateEditorSlice';
import { Class, PropertyShape } from 'services/backend/types';
import { ActionMeta, SelectInstance } from 'react-select';

type TemplateComponentValueProps = {
    id: number;
    handleClassOfPropertySelect: (selected: Class, action: ActionMeta<Class>, index: number) => void;
};

const TemplateComponentValue: FC<TemplateComponentValueProps> = ({ id, handleClassOfPropertySelect }) => {
    // @ts-expect-error
    const propertyShape: PropertyShape = useSelector((state) => state.templateEditor.properties[id]);
    const strCardinality = `${propertyShape.min_count || '*'},${propertyShape.max_count || '*'}`;
    const mapOptions: { [key: string]: string } = {
        '*,*': '0,*',
        '0,*': '0,*',
        '0,1': '0,1',
        '1,1': '1,1',
        '1,*': '1,*',
    };
    const [cardinality, setCardinality] = useState(mapOptions[strCardinality] || 'range');
    const classAutocompleteRef = useRef<SelectInstance<Class> | null>(null);
    const { isEditMode } = useIsEditMode();

    const dispatch = useDispatch();
    // @ts-expect-error
    const propertyShapes: PropertyShape[] = useSelector((state) => state.templateEditor.properties);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            const _item = { ...item };
            if (j === id) {
                // @ts-expect-error
                _item[e.target.name] = e.target.value.toString();
            }
            return _item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    const onChangeCardinality = (e: ChangeEvent<HTMLInputElement>) => {
        setCardinality(e.target.value);

        if (e.target.value !== 'range') {
            const [minCount, maxCount] = e.target.value.split(',');
            const templatePropertyShapes = propertyShapes.map((item, j) => {
                const _item = { ...item };
                if (j === id) {
                    _item.min_count = parseInt(minCount, 10);
                    _item.max_count = maxCount !== '*' ? parseInt(maxCount, 10) : undefined;
                }
                return _item;
            });
            dispatch(updatePropertyShapes(templatePropertyShapes));
        }
    };

    let range = null;

    if ('class' in propertyShape && propertyShape.class !== undefined) {
        range = propertyShape.class;
    } else if ('datatype' in propertyShape && propertyShape.datatype !== undefined) {
        range = propertyShape.datatype;
    }

    return (
        <ValuesStyle className="col-8 valuesList">
            <div>
                <InputGroup size="sm">
                    <AutoComplete
                        entityType={ENTITIES.CLASS}
                        placeholder={isEditMode ? 'Select or type to enter a class' : 'No Class'}
                        onChange={(selected: Class, action: ActionMeta<Class>) => {
                            // blur the field allows to focus and open the menu again
                            classAutocompleteRef.current && classAutocompleteRef.current.blur();
                            handleClassOfPropertySelect(selected, action, id);
                        }}
                        value={range}
                        autoLoadOption
                        openMenuOnFocus
                        allowCreate
                        isDisabled={!isEditMode}
                        copyValueButton
                        isClearable
                        defaultOptions={DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE).map((dt) => ({ label: dt.name, id: dt.classId }))}
                        innerRef={classAutocompleteRef}
                        linkButton={range && range.id ? reverse(ROUTES.CLASS, { id: range.id }) : ''}
                        linkButtonTippy="Go to class page"
                        cssClasses="form-control-sm"
                        autoFocus={false}
                        ols
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
                    <div className="mt-2">
                        <FormGroup row>
                            <Label className="text-end text-muted" for="minCountValueInput" sm={3}>
                                <small>Minimum Occurrence</small>
                            </Label>
                            <Col sm={9}>
                                <Input
                                    disabled={!isEditMode}
                                    onChange={onChange}
                                    bsSize="sm"
                                    value={propertyShape.min_count || ''}
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="min_count"
                                    id="minCountValueInput"
                                    placeholder="Minimum number of occurrences in the resource"
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label className="text-end text-muted" for="maxCountValueInput" sm={3}>
                                <small>Maximum Occurrence</small>
                            </Label>
                            <Col sm={9}>
                                <Input
                                    disabled={!isEditMode}
                                    onChange={onChange}
                                    bsSize="sm"
                                    value={propertyShape.max_count !== null ? propertyShape.max_count : ''}
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="max_count"
                                    id="maxCountValueInput"
                                    placeholder="Maximum number of occurrences in the resource"
                                />
                                {isEditMode && <FormText className="d-block">Clear the input field if there is no restriction (unbounded)</FormText>}
                            </Col>
                        </FormGroup>
                    </div>
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
                            value={propertyShape.placeholder || ''}
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
                            value={propertyShape.description || ''}
                            type="textarea"
                            name="description"
                            id="descriptionInput"
                            placeholder="Enter a description for the input form"
                        />
                    </Col>
                </FormGroup>

                {range && ['Decimal', 'Integer'].includes(range.id) && <ValidationRulesNumber id={id} />}
                {range && ['String'].includes(range.id) && <ValidationRulesString id={id} />}
            </div>
        </ValuesStyle>
    );
};

TemplateComponentValue.propTypes = {
    id: PropTypes.number.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired,
};

export default TemplateComponentValue;
