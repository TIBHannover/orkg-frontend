import React, { useState, useCallback } from 'react';
import { Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import Confirm from 'reactstrap-confirm';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import { setComponents } from 'actions/addTemplate';
import { createPredicate, createClass } from 'network';
import TemplateComponent from 'components/ContributionTemplates/TemplateComponent/TemplateComponent';
import AddPropertyTemplate from 'components/StatementBrowser/AddProperty/AddPropertyTemplate';
import update from 'immutability-helper';
import PropTypes from 'prop-types';

function ComponentsTab(props) {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [newPropertyLabel, setNewPropertyLabel] = useState('');
    const [confirmNewPropertyModal, setConfirmNewPropertyModal] = useState(false);

    const handleDeleteTemplateComponent = index => {
        props.setComponents(props.components.filter((item, j) => index !== j));
    };

    const handlePropertiesSelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new property?',
                message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
                cancelColor: 'light'
            });
            if (result) {
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
            const result = await ConfirmClass({
                label: selected.label
            });
            if (result) {
                const newClass = await createClass(selected.label, result.uri ? result.uri : null);
                selected = { id: newClass.id, label: selected.label };
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

    const toggleConfirmNewProperty = propertyLabel => {
        if (!confirmNewPropertyModal) {
            setNewPropertyLabel(propertyLabel);
        }
        setConfirmNewPropertyModal(prev => !prev);
    };

    const handleCreateNewProperty = async () => {
        const newPredicate = await createPredicate(newPropertyLabel);
        toggleConfirmNewProperty(); // hide dialog
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
                                key={`tc${index}`}
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
                        <Modal isOpen={confirmNewPropertyModal} toggle={toggleConfirmNewProperty}>
                            <ModalHeader toggle={toggleConfirmNewProperty}>Are you sure you need a new property?</ModalHeader>
                            <ModalBody>
                                Often there are existing properties that you can use as well. It is better to use existing properties than new ones.
                            </ModalBody>
                            <ModalFooter>
                                <Button color="light" onClick={toggleConfirmNewProperty}>
                                    Cancel
                                </Button>{' '}
                                <Button color="primary" onClick={handleCreateNewProperty}>
                                    Create new property
                                </Button>
                            </ModalFooter>
                        </Modal>
                    </>
                )}
            </div>
        </div>
    );
}

ComponentsTab.propTypes = {
    components: PropTypes.array.isRequired,
    editMode: PropTypes.bool.isRequired,
    setComponents: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        components: state.addTemplate.components,
        editMode: state.addTemplate.editMode
    };
};

const mapDispatchToProps = dispatch => ({
    setComponents: data => dispatch(setComponents(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsTab);
