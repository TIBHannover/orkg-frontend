import { createPropertyAction as createProperty, getNewPropertiesList, canAddProperty as canAddPropertyAction } from 'slices/statementBrowserSlice';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';

function useAddProperty({ resourceId, syncBackend }) {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const canAddProperty = useSelector(state => canAddPropertyAction(state, resourceId));
    const newProperties = useSelector(state => getNewPropertiesList(state));
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');

    const dispatch = useDispatch();

    const toggleConfirmNewProperty = useCallback(async label => {
        setPropertyLabel(label);
        setIsOpenConfirmModal(true);
    }, []);

    const handleCreate = ({ id }) => {
        if (syncBackend) {
            dispatch(
                createProperty({
                    resourceId,
                    existingPredicateId: id,
                    label: propertyLabel,
                }),
            );
        } else {
            dispatch(
                createProperty({
                    resourceId,
                    label: propertyLabel,
                }),
            );
        }
        setShowAddProperty(false);
        setIsOpenConfirmModal(false);
    };

    const toggleModal = () => {
        if (isOpenConfirmModal) {
            setShowAddProperty(false);
        }
        setIsOpenConfirmModal(v => !v);
    };

    const ConfirmPropertyModal = () =>
        isOpenConfirmModal ? (
            <ConfirmCreatePropertyModal
                onCreate={handleCreate}
                label={propertyLabel}
                toggle={toggleModal}
                shouldPerformCreate={syncBackend}
                shouldHideDescriptionInput={!syncBackend}
            />
        ) : null;

    const handlePropertySelect = ({ id, value: label }) => {
        setShowAddProperty(false);
        dispatch(
            createProperty({
                resourceId,
                existingPredicateId: id,
                label,
            }),
        );
    };

    return {
        showAddProperty,
        newProperties,
        canAddProperty,
        setShowAddProperty,
        handlePropertySelect,
        toggleConfirmNewProperty,
        ConfirmPropertyModal,
    };
}

export default useAddProperty;
