import React, { useState } from 'react';
import { createPredicate } from 'services/backend/predicates';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import AddPropertyTemplate from './AddPropertyTemplate';
import { createProperty } from 'actions/statementBrowser';
import { uniqBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const AddProperty = props => {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [confirmNewPropertyModal, setConfirmNewPropertyModal] = useState(false);
    const [newPropertyLabel, setNewPropertyLabel] = useState('');
    const dispatch = useDispatch();
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const newProperties = useSelector(state => {
        const newPropertiesList = [];

        for (const key in state.statementBrowser.properties.byId) {
            const property = state.statementBrowser.properties.byId[key];

            if (!property.existingPredicateId) {
                newPropertiesList.push({
                    id: null,
                    label: property.label
                });
            }
        }
        //  ensure no properties with duplicate Labels exist
        return uniqBy(newPropertiesList, 'label');
    });

    const handleShowAddProperty = () => {
        setShowAddProperty(true);
    };

    const handleHideAddProperty = () => {
        setShowAddProperty(false);
        setNewPropertyLabel('');
    };

    const toggleConfirmNewProperty = propertyLabel => {
        setConfirmNewPropertyModal(!confirmNewPropertyModal);
        setNewPropertyLabel(propertyLabel);
    };

    const handlePropertySelect = ({ id, value: label }) => {
        setShowAddProperty(false);

        dispatch(
            createProperty({
                resourceId: props.resourceId ? props.resourceId : selectedResource,
                existingPredicateId: id,
                label: label,
                isTemplate: false,
                createAndSelect: true
            })
        );
    };

    const handleNewProperty = async () => {
        setShowAddProperty(false);
        toggleConfirmNewProperty(); // hide dialog

        if (props.syncBackend) {
            const newPredicate = await createPredicate(newPropertyLabel);
            dispatch(
                createProperty({
                    resourceId: props.resourceId ? props.resourceId : selectedResource,
                    existingPredicateId: newPredicate.id,
                    label: newPredicate.label,
                    isTemplate: false,
                    createAndSelect: true
                })
            );
        } else {
            dispatch(
                createProperty({
                    resourceId: props.resourceId ? props.resourceId : selectedResource,
                    label: newPropertyLabel,
                    isTemplate: false,
                    createAndSelect: true
                })
            );
        }
    };

    return (
        <>
            <AddPropertyTemplate
                inTemplate={props.inTemplate}
                isDisabled={props.isDisabled}
                showAddProperty={showAddProperty}
                handlePropertySelect={handlePropertySelect}
                toggleConfirmNewProperty={toggleConfirmNewProperty}
                handleHideAddProperty={handleHideAddProperty}
                newProperties={newProperties}
                handleShowAddProperty={handleShowAddProperty}
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
                    <Button color="primary" onClick={handleNewProperty}>
                        Create new property
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

AddProperty.propTypes = {
    resourceId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    inTemplate: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool.isRequired
};

AddProperty.defaultProps = {
    inTemplate: false,
    isDisabled: false
};

export default AddProperty;
