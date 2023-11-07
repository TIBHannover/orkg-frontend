import PropTypes from 'prop-types';
import AddPropertyView from 'components/StatementBrowser/AddProperty/AddPropertyView';
import useAddProperty from 'components/StatementBrowser/AddProperty/hooks/useAddProperty';

const AddProperty = ({ inTemplate = false, resourceId, syncBackend }) => {
    const {
        showAddProperty,
        newProperties,
        canAddProperty,
        setShowAddProperty,
        handlePropertySelect,
        toggleConfirmNewProperty,
        ConfirmPropertyModal,
    } = useAddProperty({
        resourceId,
        syncBackend,
    });

    return (
        <>
            <AddPropertyView
                inTemplate={inTemplate}
                isDisabled={!canAddProperty}
                showAddProperty={showAddProperty}
                handlePropertySelect={handlePropertySelect}
                toggleConfirmNewProperty={toggleConfirmNewProperty}
                setShowAddProperty={setShowAddProperty}
                newProperties={newProperties}
                key={showAddProperty}
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

export default AddProperty;
