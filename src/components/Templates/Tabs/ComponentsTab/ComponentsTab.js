import { useState, useCallback } from 'react';
import { Row, Col, FormGroup, Input, Label } from 'reactstrap';
import { connect } from 'react-redux';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import { updateComponents, updateIsStrict } from 'slices/templateEditorSlice';
import { createPredicate } from 'services/backend/predicates';
import TemplateComponent from 'components/Templates/TemplateComponent/TemplateComponent';
import AddPropertyView from 'components/StatementBrowser/AddProperty/AddPropertyView';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';

function ComponentsTab(props) {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const { confirmProperty } = useConfirmPropertyModal();

    const handleDeleteTemplateComponent = index => {
        props.updateComponents(props.components.filter((item, j) => index !== j));
    };

    const handlePropertiesSelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            const confirmedProperty = await confirmProperty();
            if (confirmedProperty) {
                const newPredicate = await createPredicate(selected.label);
                selected = { id: newPredicate.id, label: selected.label };
                const templateComponents = props.components.map((item, j) => {
                    const _item = { ...item };
                    if (j === index) {
                        _item.property = !selected ? null : selected;
                    }
                    return _item;
                });
                props.updateComponents(templateComponents);
            }
        } else {
            const templateComponents = props.components.map((item, j) => {
                const _item = { ...item };
                if (j === index) {
                    _item.property = !selected ? null : selected;
                }
                return _item;
            });
            props.updateComponents(templateComponents);
        }
    };

    const handleClassOfPropertySelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label
            });
            if (newClass) {
                selected = { id: newClass.id, label: newClass.label };
            } else {
                return null;
            }
        }
        const templateComponents = props.components.map((item, j) => {
            const _item = { ...item };
            if (j === index) {
                _item.value = !selected ? null : selected;
                _item.validationRules = {};
            }
            return _item;
        });

        props.updateComponents(templateComponents);
    };

    const handleSelectNewProperty = ({ id, value: label }) => {
        const templateComponents = [
            ...props.components,
            { property: { id, label: label }, value: {}, validationRules: {}, minOccurs: '0', maxOccurs: null, order: null }
        ];
        props.updateComponents(templateComponents);
        setShowAddProperty(false);
    };

    const toggleConfirmNewProperty = async label => {
        const confirmNewProperty = await confirmProperty();

        if (confirmNewProperty) {
            handleCreateNewProperty(label);
        }
    };

    const handleCreateNewProperty = async label => {
        const newPredicate = await createPredicate(label);
        const templateComponents = [
            ...props.components,
            {
                property: { id: newPredicate.id, label: newPredicate.label },
                value: {},
                validationRules: {},
                minOccurs: '0',
                maxOccurs: null,
                order: null
            }
        ];
        props.updateComponents(templateComponents);
        setShowAddProperty(false);
    };

    const moveCard = useCallback(
        (dragIndex, hoverIndex) => {
            const dragCard = props.components[dragIndex];
            props.updateComponents(
                update(props.components, {
                    $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]]
                })
            );
        },
        [props]
    );

    const handleSwitchIsStrictTemplate = event => {
        props.updateIsStrict(event.target.checked);
    };

    return (
        <div className="p-4">
            <div className="pb-4">
                {props.components && props.components.length > 0 && (
                    <Row className="text-center">
                        <Col md={6}>Property</Col>
                        <Col md={5}>Type</Col>
                    </Row>
                )}
                {props.components &&
                    props.components.length > 0 &&
                    props.components.map((templateProperty, index) => {
                        return (
                            <TemplateComponent
                                key={`tc${templateProperty.property.id}`}
                                enableEdit={props.editMode}
                                handleDeleteTemplateComponent={handleDeleteTemplateComponent}
                                id={index}
                                moveCard={moveCard}
                                property={templateProperty.property}
                                value={templateProperty.value}
                                minOccurs={templateProperty.minOccurs}
                                maxOccurs={templateProperty.maxOccurs}
                                validationRules={templateProperty.validationRules}
                                handlePropertiesSelect={handlePropertiesSelect}
                                handleClassOfPropertySelect={handleClassOfPropertySelect}
                            />
                        );
                    })}
                {props.components && props.components.length === 0 && <i>No properties specified.</i>}
                {props.editMode && (
                    <>
                        <AddPropertyView
                            showAddProperty={showAddProperty}
                            handlePropertySelect={handleSelectNewProperty}
                            toggleConfirmNewProperty={toggleConfirmNewProperty}
                            setShowAddProperty={setShowAddProperty}
                        />
                    </>
                )}
                <FormGroup className="mt-3">
                    <div>
                        <Input
                            onChange={handleSwitchIsStrictTemplate}
                            checked={props.isStrictTemplate}
                            id="switchIsStrictTemplate"
                            type="switch"
                            name="customSwitch"
                            disabled={!props.editMode}
                        />{' '}
                        <Label for="switchIsStrictTemplate" className="mb-0">
                            This template is strict (users cannot add additional properties themselves)
                        </Label>
                    </div>
                </FormGroup>
            </div>
        </div>
    );
}

ComponentsTab.propTypes = {
    components: PropTypes.array.isRequired,
    editMode: PropTypes.bool.isRequired,
    updateComponents: PropTypes.func.isRequired,
    updateIsStrict: PropTypes.func.isRequired,
    isStrictTemplate: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    return {
        components: state.templateEditor.components,
        editMode: state.templateEditor.editMode,
        isStrictTemplate: state.templateEditor.isStrict
    };
};

const mapDispatchToProps = dispatch => ({
    updateComponents: data => dispatch(updateComponents(data)),
    updateIsStrict: data => dispatch(updateIsStrict(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsTab);
