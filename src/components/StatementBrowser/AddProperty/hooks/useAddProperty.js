import { createProperty, getNewPropertiesList, canAddProperty as canAddPropertyAction } from 'actions/statementBrowser';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createPredicate } from 'services/backend/predicates';

function useAddProperty({ resourceId, syncBackend }) {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const canAddProperty = useSelector(state => canAddPropertyAction(state, resourceId));
    const newProperties = useSelector(state => getNewPropertiesList(state));

    const dispatch = useDispatch();

    const { confirmProperty } = useConfirmPropertyModal();

    const toggleConfirmNewProperty = useCallback(
        async label => {
            const handleNewProperty = async label => {
                setShowAddProperty(false);
                if (syncBackend) {
                    setIsLoading(true);
                    createPredicate(label)
                        .then(newPredicate => {
                            dispatch(
                                createProperty({
                                    resourceId: resourceId,
                                    existingPredicateId: newPredicate.id,
                                    label: newPredicate.label
                                })
                            );
                            setIsLoading(false);
                        })
                        .catch(() => {
                            toast.error('Something went wrong, please try again');
                            setIsLoading(false);
                        });
                } else {
                    dispatch(
                        createProperty({
                            resourceId: resourceId,
                            label
                        })
                    );
                }
            };

            const confirmNewProperty = await confirmProperty();

            if (confirmNewProperty) {
                handleNewProperty(label);
            }
        },
        [confirmProperty, dispatch, resourceId, syncBackend]
    );

    const handlePropertySelect = ({ id, value: label }) => {
        setShowAddProperty(false);
        dispatch(
            createProperty({
                resourceId: resourceId,
                existingPredicateId: id,
                label: label
            })
        );
    };

    return {
        isLoading,
        showAddProperty,
        newProperties,
        canAddProperty,
        setShowAddProperty,
        handlePropertySelect,
        toggleConfirmNewProperty
    };
}

export default useAddProperty;
