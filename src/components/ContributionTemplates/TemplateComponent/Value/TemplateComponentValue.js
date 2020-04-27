import React from 'react';
import { InputGroup, FormGroup, Label, Col, Input } from 'reactstrap';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import AutoComplete from 'components/ContributionTemplates/TemplateEditorAutoComplete';
import { setComponents } from 'actions/addTemplate';
import { connect } from 'react-redux';
import { classesUrl } from 'network';
import PropTypes from 'prop-types';
import ValidationRules from '../ValidationRules/ValidationRules';

function TemplateComponentValue(props) {
    const onChange = event => {
        const templateComponents = props.components.map((item, j) => {
            if (j === props.id) {
                item[event.target.name] = event.target.value.toString();
            }
            return item;
        });
        props.setComponents(templateComponents);
    };

    return (
        <ValuesStyle className={'col-8 valuesList'}>
            <div>
                <InputGroup size="sm">
                    <AutoComplete
                        requestUrl={classesUrl}
                        placeholder={props.enableEdit ? 'Select or type to enter a class' : 'No Class'}
                        onItemSelected={(selected, action) => props.handleClassOfPropertySelect(selected, action, props.id)}
                        onKeyUp={() => {}}
                        allowCreate
                        value={props.value}
                        isDisabled={!props.enableEdit}
                        isClearable={true}
                        defaultOptions={defaultDatatypes}
                        cssClasses={'form-control-sm'}
                    />
                </InputGroup>
                <div className="mt-2">
                    <FormGroup row>
                        <Label className={'text-right text-muted'} for="minOccursValueInput" sm={3}>
                            <small>Minimum Occurence</small>
                        </Label>
                        <Col sm={9}>
                            <Input
                                disabled={!props.enableEdit}
                                onChange={onChange}
                                bsSize="sm"
                                value={props.minOccurs}
                                type="number"
                                name="minOccurs"
                                id="minOccursValueInput"
                                placeholder="Specify the minimum number of times this component can occur in the resource"
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label className={'text-right text-muted'} for="maxOccursValueInput" sm={3}>
                            <small>Maximum Occurence</small>
                        </Label>
                        <Col sm={9}>
                            <Input
                                disabled={!props.enableEdit}
                                onChange={onChange}
                                bsSize="sm"
                                value={props.maxOccurs !== null ? props.maxOccurs : ''}
                                type="number"
                                name="maxOccurs"
                                id="maxOccursValueInput"
                                placeholder="Specify the maximum number of times this component can occur in the resource"
                            />
                        </Col>
                    </FormGroup>
                </div>
                {props.value && ['Number', 'String'].includes(props.value.id) && (
                    <ValidationRules validationRules={props.validationRules} id={props.id} value={props.value} enableEdit={props.enableEdit} />
                )}
            </div>
        </ValuesStyle>
    );
}

TemplateComponentValue.propTypes = {
    components: PropTypes.array.isRequired,
    setComponents: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    value: PropTypes.object.isRequired,
    minOccurs: PropTypes.string.isRequired,
    maxOccurs: PropTypes.string,
    enableEdit: PropTypes.bool.isRequired,
    validationRules: PropTypes.object.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        components: state.addTemplate.components
    };
};

const mapDispatchToProps = dispatch => ({
    setComponents: data => dispatch(setComponents(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TemplateComponentValue);
