import { createProperty } from 'actions/statementBrowser';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';
import { uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPredicate } from 'services/backend/predicates';
import AddPropertyTemplate from './AddPropertyTemplate';

const AddProperty = props => {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const dispatch = useDispatch();
    const { confirmProperty } = useConfirmPropertyModal();
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
    };

    const toggleConfirmNewProperty = async label => {
        const confirmNewProperty = await confirmProperty();

        if (confirmNewProperty) {
            handleNewProperty(label);
        }
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

    const handleNewProperty = async label => {
        setShowAddProperty(false);

        if (props.syncBackend) {
            const newPredicate = await createPredicate(label);
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
                    label,
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
