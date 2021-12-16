import PropTypes from 'prop-types';
import AddPropertyView from './AddPropertyView';
import useAddProperty from './hooks/useAddProperty';

const AddProperty = props => {
    const {
        isLoading,
        showAddProperty,
        newProperties,
        canAddProperty,
        setShowAddProperty,
        handlePropertySelect,
        toggleConfirmNewProperty
    } = useAddProperty({
        resourceId: props.resourceId,
        syncBackend: props.syncBackend
    });

    return (
        <>
            <AddPropertyView
                inTemplate={props.inTemplate}
                isDisabled={!canAddProperty}
                isLoading={isLoading}
                showAddProperty={showAddProperty}
                handlePropertySelect={handlePropertySelect}
                toggleConfirmNewProperty={toggleConfirmNewProperty}
                setShowAddProperty={setShowAddProperty}
                newProperties={newProperties}
            />
        </>
    );
};

AddProperty.propTypes = {
    resourceId: PropTypes.string.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    inTemplate: PropTypes.bool
};

AddProperty.defaultProps = {
    inTemplate: false
};

export default AddProperty;
