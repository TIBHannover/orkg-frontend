import { useState, useCallback } from 'react';
import { Row, Col, FormGroup, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import { setComponents, setIsStrictTemplate } from 'actions/addTemplate';
import { createPredicate } from 'services/backend/predicates';
import TemplateComponent from 'components/Templates/TemplateComponent/TemplateComponent';
import AddPropertyTemplate from 'components/StatementBrowser/AddProperty/AddPropertyTemplate';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';

function ComponentsTab(props) {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const { confirmProperty } = useConfirmPropertyModal();

    const handleDeleteTemplateComponent = index => {
        props.setComponents(props.components.filter((item, j) => index !== j));
    };

    const handlePropertiesSelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            const confirmedProperty = await confirmProperty();
            if (confirmedProperty) {
                const newPredicate = await createPredicate(selected.label);
                selected = { id: newPredicate.id, label: selected.label };
                const templateComponents = props.components.map((item, j) => {
                    if (j === index) {
                        item.property = !selected ? null : selected;
                    }
                    return item;
                });
                props.setComponents(templateComponents);
            }
        } else {
            const templateComponents = props.components.map((item, j) => {
                if (j === index) {
                    item.property = !selected ? null : selected;
                }
                return item;
            });
            props.setComponents(templateComponents);
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
            if (j === index) {
                item.value = !selected ? null : selected;
                item.validationRules = {};
            }
            return item;
        });

        props.setComponents(templateComponents);
    };

    const handleSelectNewProperty = ({ id, value: label }) => {
        const templateComponents = [
            ...props.components,
            { property: { id, label: label }, value: {}, validationRules: {}, minOccurs: '0', maxOccurs: null, order: null }
        ];
        props.setComponents(templateComponents);
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
        props.setComponents(templateComponents);
        setShowAddProperty(false);
    };

    const moveCard = useCallback(
        (dragIndex, hoverIndex) => {
            const dragCard = props.components[dragIndex];
            props.setComponents(
                update(props.components, {
                    $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]]
                })
            );
        },
        [props]
    );

    const handleSwitchIsStrictTemplate = event => {
        props.setIsStrictTemplate(event.target.checked);
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
                        <AddPropertyTemplate
                            inTemplate={false}
                            isDisabled={false}
                            showAddProperty={showAddProperty}
                            handlePropertySelect={handleSelectNewProperty}
                            toggleConfirmNewProperty={toggleConfirmNewProperty}
                            handleHideAddProperty={() => {
                                setShowAddProperty(false);
                            }}
                            handleShowAddProperty={() => {
                                setShowAddProperty(true);
                            }}
                            newProperties={[]}
                        />
                    </>
                )}
                <FormGroup className="mt-3">
                    <div>
                        <CustomInput
                            onChange={handleSwitchIsStrictTemplate}
                            checked={props.isStrictTemplate}
                            id="switchIsStrictTemplate"
                            type="switch"
                            name="customSwitch"
                            label="This template is strict (users cannot add additional properties themselves)"
                            disabled={!props.editMode}
                        />
                    </div>
                </FormGroup>
            </div>
        </div>
    );
}

ComponentsTab.propTypes = {
    components: PropTypes.array.isRequired,
    editMode: PropTypes.bool.isRequired,
    setComponents: PropTypes.func.isRequired,
    setIsStrictTemplate: PropTypes.func.isRequired,
    isStrictTemplate: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    return {
        components: state.addTemplate.components,
        editMode: state.addTemplate.editMode,
        isStrictTemplate: state.addTemplate.isStrict
    };
};

const mapDispatchToProps = dispatch => ({
    setComponents: data => dispatch(setComponents(data)),
    setIsStrictTemplate: data => dispatch(setIsStrictTemplate(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsTab);
