import Autocomplete from 'components/Autocomplete/Autocomplete';
import CopyIdButton from 'components/Autocomplete/ValueButtons/CopyIdButton';
import LinkButton from 'components/Autocomplete/ValueButtons/LinkButton';
import { OptionType } from 'components/Autocomplete/types';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import ValidationRulesNumber from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/ValidationRules/ValidationRulesNumber';
import ValidationRulesString from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/ValidationRules/ValidationRulesString';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import DATA_TYPES from 'constants/DataTypes';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { ChangeEvent, FC, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, SelectInstance, SingleValue } from 'react-select';
import { Col, FormGroup, FormText, Input, InputGroup, Label } from 'reactstrap';
import { Class, PropertyShape } from 'services/backend/types';
import { updatePropertyShapes } from 'slices/templateEditorSlice';

type TemplateComponentValueProps = {
    id: number;
    handleClassOfPropertySelect: (selected: SingleValue<OptionType>, action: ActionMeta<OptionType>, index: number) => void;
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
                    <Autocomplete
                        entityType={ENTITIES.CLASS}
                        placeholder={isEditMode ? 'Select or type to enter a class' : 'No Class'}
                        onChange={(selected: SingleValue<OptionType>, action: ActionMeta<OptionType>) => {
                            handleClassOfPropertySelect(selected, action, id);
                        }}
                        value={range}
                        openMenuOnFocus
                        allowCreate
                        isDisabled={!isEditMode}
                        isClearable
                        defaultOptions={DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE).map((dt) => ({ label: dt.name, id: dt.classId }))}
                        size="sm"
                        enableExternalSources
                    />
                    <CopyIdButton value={range} />
                    <LinkButton value={range} />
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

                {range && [CLASSES.INTEGER, CLASSES.DECIMAL].includes(range.id) && <ValidationRulesNumber id={id} />}
                {range && [CLASSES.STRING].includes(range.id) && <ValidationRulesString id={id} />}
            </div>
        </ValuesStyle>
    );
};

TemplateComponentValue.propTypes = {
    id: PropTypes.number.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired,
};

export default TemplateComponentValue;
