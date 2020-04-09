import React, { useState } from 'react';
import { Button, FormGroup, Label, FormText, InputGroup, InputGroupAddon, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import Confirm from 'reactstrap-confirm';
import { setComponents, setSubTemplates } from 'actions/addTemplate';
import { resourcesUrl, createPredicate, createClass } from 'network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/ContributionTemplates/TemplateEditorAutoComplete';
import TemplateComponent from 'components/ContributionTemplates/TemplateComponent/TemplateComponent';
import AddPropertyTemplate from 'components/StatementBrowser/AddProperty/AddPropertyTemplate';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import PropTypes from 'prop-types';

function ComponentsTab(props) {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [newPropertyLabel, setNewPropertyLabel] = useState('');
    const [confirmNewPropertyModal, setConfirmNewPropertyModal] = useState(false);

    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

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
            const result = await Confirm({
                title: 'Are you sure you need a new class?',
                message: 'Often there are existing classes that you can use as well. It is better to use existing classes than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const newPredicate = await createClass(selected.label);
                selected = { id: newPredicate.id, label: selected.label };

                const templateComponents = props.components.map((item, j) => {
                    if (j === index) {
                        item.value = !selected ? null : selected;
                    }
                    return item;
                });
                props.setComponents(templateComponents);
            }
        } else {
            const templateComponents = props.components.map((item, j) => {
                if (j === index) {
                    item.value = !selected ? null : selected;
                }
                return item;
            });

            props.setComponents(templateComponents);
        }
    };

    const handleSelectNewProperty = ({ id, value: label }) => {
        const templateComponents = [...props.components, { property: { id, label: label }, value: {} }];
        props.setComponents(templateComponents);
        setShowAddProperty(false);
    };

    const toggleConfirmNewProperty = propertyLabel => {
        newPropertyLabel(propertyLabel);
        setConfirmNewPropertyModal(prev => !prev);
    };

    const handleCreateNewProperty = async () => {
        const newPredicate = await createPredicate(newPropertyLabel);
        toggleConfirmNewProperty(); // hide dialog
        const templateComponents = [...props.components, { property: { id: newPredicate.id, label: newPredicate.label } }];
        props.setComponents(templateComponents);
        setShowAddProperty(false);
    };

    const handleSubTemplatesSelect = (selected, index) => {
        const templateSubTemplates = props.subTemplates.map((item, j) => {
            if (j === index) {
                item = !selected ? null : selected;
            }
            return item;
        });
        props.setSubTemplates(templateSubTemplates);
    };

    const openStatementBrowser = (id, label) => {
        setModal(true);
        setDialogResourceId(id);
        setDialogResourceLabel(label);
    };

    const deleteSubTemplate = index => {
        const templateSubTemplates = props.subTemplates.filter((item, j) => index !== j);
        props.setSubTemplates(templateSubTemplates);
    };

    const addSubTemplate = () => {
        const templateSubTemplates = [...props.subTemplates, {}];
        props.setSubTemplates(templateSubTemplates);
    };

    return (
        <div className="p-4">
            <div className="pb-4">
                {props.components && props.components.length > 0 && (
                    <Row className={'text-center'}>
                        <Col md={6}>Property</Col>
                        <Col md={5}>Type</Col>
                    </Row>
                )}
                {props.components &&
                    props.components.length > 0 &&
                    props.components.map((templateProperty, index) => {
                        return (
                            <>
                                <TemplateComponent
                                    enableEdit={props.editMode}
                                    handleDeleteTemplateComponent={handleDeleteTemplateComponent}
                                    id={index}
                                    property={templateProperty.property}
                                    value={templateProperty.value}
                                    handlePropertiesSelect={handlePropertiesSelect}
                                    handleClassOfPropertySelect={handleClassOfPropertySelect}
                                />
                            </>
                        );
                    })}
                {props.components && props.components.length === 0 && <i>No properties specified.</i>}
                {props.editMode && (
                    <>
                        <AddPropertyTemplate
                            inTemplate={false}
                            showAddProperty={showAddProperty}
                            handlePropertySelect={handleSelectNewProperty}
                            toggleConfirmNewProperty={toggleConfirmNewProperty}
                            handleHideAddProperty={() => {
                                setShowAddProperty(false);
                                setNewPropertyLabel('');
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
            {!props.isClassDescription && (
                <fieldset className="scheduler-border">
                    <legend className="scheduler-border">Sub-Templates</legend>
                    <FormGroup className="mb-4">
                        <Label>{props.editMode && <FormText>List the sub-templates of this template.</FormText>}</Label>
                        <div className={'clearfix mb-3'} />
                        {props.subTemplates &&
                            props.subTemplates.length > 0 &&
                            props.subTemplates.map((templateSubTemplate, index) => {
                                return (
                                    <div key={`subtemplate-${index}`}>
                                        <InputGroup className={'mt-2 mb-2'}>
                                            <InputGroupAddon addonType="prepend">{`${index + 1}`}</InputGroupAddon>
                                            <AutoComplete
                                                requestUrl={resourcesUrl}
                                                optionsClass={process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}
                                                placeholder={props.editMode ? 'Select or type to enter a contribution template' : 'No sub template'}
                                                onItemSelected={selected => handleSubTemplatesSelect(selected, index)}
                                                onKeyUp={() => {}}
                                                value={templateSubTemplate}
                                                isDisabled={!props.editMode}
                                            />
                                            {templateSubTemplate.id && (
                                                <InputGroupAddon addonType="append">
                                                    <Button
                                                        outline
                                                        color="info"
                                                        onClick={() => openStatementBrowser(templateSubTemplate.id, templateSubTemplate.label)}
                                                    >
                                                        View template
                                                    </Button>
                                                </InputGroupAddon>
                                            )}
                                            {props.editMode && (
                                                <InputGroupAddon addonType="append">
                                                    <Button outline color="danger" onClick={() => deleteSubTemplate(index)}>
                                                        <Icon icon={faTrash} />
                                                    </Button>
                                                </InputGroupAddon>
                                            )}
                                        </InputGroup>
                                    </div>
                                );
                            })}
                        {!props.editMode && props.subTemplates && props.subTemplates.length === 0 && (
                            <i>
                                <small>No sub-templates specified.</small>
                            </i>
                        )}
                        {props.editMode && (
                            <Button outline size="sm" className={'mb-3'} onClick={() => addSubTemplate()}>
                                Add sub-template
                            </Button>
                        )}
                    </FormGroup>
                </fieldset>
            )}

            {modal && (
                <StatementBrowserDialog
                    show={modal}
                    enableEdit={false}
                    toggleModal={() => setModal(prev => !prev)}
                    resourceId={dialogResourceId}
                    resourceLabel={dialogResourceLabel}
                />
            )}
        </div>
    );
}

ComponentsTab.propTypes = {
    components: PropTypes.array.isRequired,
    subTemplates: PropTypes.array.isRequired,
    editMode: PropTypes.bool.isRequired,
    setComponents: PropTypes.func.isRequired,
    setSubTemplates: PropTypes.func.isRequired,
    isClassDescription: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    return {
        components: state.addTemplate.components,
        subTemplates: state.addTemplate.subTemplates,
        editMode: state.addTemplate.editMode,
        isClassDescription: state.addTemplate.isClassDescription
    };
};

const mapDispatchToProps = dispatch => ({
    setComponents: data => dispatch(setComponents(data)),
    setSubTemplates: data => dispatch(setSubTemplates(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsTab);
