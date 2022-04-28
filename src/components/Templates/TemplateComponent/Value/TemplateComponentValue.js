import { useState, useRef } from 'react';
import { InputGroup, FormGroup, Label, Col, Input, FormText } from 'reactstrap';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import DATA_TYPES from 'constants/DataTypes.js';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { updateComponents } from 'slices/templateEditorSlice';
import { connect } from 'react-redux';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import ValidationRules from '../ValidationRules/ValidationRules';

function TemplateComponentValue(props) {
    const [cardinality, setCardinality] = useState(!props.minOccurs && !props.maxOccurs ? '0,*' : 'range');
    const classAutocompleteRef = useRef(null);

    const onChange = event => {
        const templateComponents = props.components.map((item, j) => {
            const _item = { ...item };
            if (j === props.id) {
                _item[event.target.name] = event.target.value.toString();
            }
            return _item;
        });
        props.updateComponents(templateComponents);
    };

    const onChangeCardinality = event => {
        setCardinality(event.target.value);

        if (event.target.value !== 'range') {
            const [minOccurs, maxOccurs] = event.target.value.split(',');
            const templateComponents = props.components.map((item, j) => {
                const _item = { ...item };
                if (j === props.id) {
                    _item.minOccurs = minOccurs;
                    _item.maxOccurs = maxOccurs !== '*' ? maxOccurs : '';
                }
                return _item;
            });
            props.updateComponents(templateComponents);
        }
    };

    return (
        <ValuesStyle className="col-8 valuesList">
            <div>
                <InputGroup size="sm">
                    <AutoComplete
                        entityType={ENTITIES.CLASS}
                        placeholder={props.enableEdit ? 'Select or type to enter a class' : 'No Class'}
                        onChange={(selected, action) => {
                            // blur the field allows to focus and open the menu again
                            classAutocompleteRef.current && classAutocompleteRef.current.blur();
                            props.handleClassOfPropertySelect(selected, action, props.id);
                        }}
                        value={props.value}
                        autoLoadOption={true}
                        openMenuOnFocus={true}
                        allowCreate={true}
                        isDisabled={!props.enableEdit}
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
                            <Input disabled={!props.enableEdit} onChange={onChangeCardinality} value={cardinality} type="select" bsSize="sm">
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
                                <Label className="text-end text-muted" for="minOccursValueInput" sm={3}>
                                    <small>Minimum Occurence</small>
                                </Label>
                                <Col sm={9}>
                                    <Input
                                        disabled={!props.enableEdit}
                                        onChange={onChange}
                                        bsSize="sm"
                                        value={props.minOccurs}
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="minOccurs"
                                        id="minOccursValueInput"
                                        placeholder="Minimum number of occurrences in the resource"
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className="text-end text-muted" for="maxOccursValueInput" sm={3}>
                                    <small>Maximum Occurence</small>
                                </Label>
                                <Col sm={9}>
                                    <Input
                                        disabled={!props.enableEdit}
                                        onChange={onChange}
                                        bsSize="sm"
                                        value={props.maxOccurs !== null ? props.maxOccurs : ''}
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="maxOccurs"
                                        id="maxOccursValueInput"
                                        placeholder="Maximum number of occurrences in the resource"
                                    />
                                    {props.enableEdit && (
                                        <FormText className="d-block">Clear the input field if there is no restriction (unbounded)</FormText>
                                    )}
                                </Col>
                            </FormGroup>
                        </div>
                    </>
                )}

                {props.value && ['Number', 'Integer', 'String'].includes(props.value.id) && (
                    <ValidationRules validationRules={props.validationRules} id={props.id} value={props.value} enableEdit={props.enableEdit} />
                )}
            </div>
        </ValuesStyle>
    );
}

TemplateComponentValue.propTypes = {
    components: PropTypes.array.isRequired,
    updateComponents: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    value: PropTypes.object,
    minOccurs: PropTypes.string.isRequired,
    maxOccurs: PropTypes.string,
    enableEdit: PropTypes.bool.isRequired,
    validationRules: PropTypes.object.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        components: state.templateEditor.components
    };
};

const mapDispatchToProps = dispatch => ({
    updateComponents: data => dispatch(updateComponents(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TemplateComponentValue);
