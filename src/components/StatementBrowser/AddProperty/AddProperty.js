import PropTypes from 'prop-types';
import AddPropertyView from './AddPropertyView';
import useAddProperty from './hooks/useAddProperty';

const AddProperty = props => {
    const {
        showAddProperty,
        newProperties,
        canAddProperty,
        setShowAddProperty,
        handlePropertySelect,
        toggleConfirmNewProperty,
        ConfirmPropertyModal,
    } = useAddProperty({
        resourceId: props.resourceId,
        syncBackend: props.syncBackend,
    });

    return (
        <>
            <AddPropertyView
                inTemplate={props.inTemplate}
                isDisabled={!canAddProperty}
                showAddProperty={showAddProperty}
                handlePropertySelect={handlePropertySelect}
                toggleConfirmNewProperty={toggleConfirmNewProperty}
                setShowAddProperty={setShowAddProperty}
                newProperties={newProperties}
            />
            <ConfirmPropertyModal />
        </>
    );
};

AddProperty.propTypes = {
    resourceId: PropTypes.string.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    inTemplate: PropTypes.bool,
};

AddProperty.defaultProps = {
    inTemplate: false,
};

export default AddProperty;
