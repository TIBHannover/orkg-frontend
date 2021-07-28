import { useState, useEffect, useCallback } from 'react';
import { changeProperty, isSavingProperty, doneSavingProperty, deleteProperty } from 'actions/statementBrowser';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createPredicate } from 'services/backend/predicates';
import { getResource } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';

function useStatementItem({ propertyId, resourceId, syncBackend }) {
    const dispatch = useDispatch();
    const property = useSelector(state => state.statementBrowser.properties.byId[propertyId]);
    const values = useSelector(state => state.statementBrowser.values);

    const [predicateLabel, setPredicateLabel] = useState(property.label);

    useEffect(() => {
        const getPredicateLabel = () => {
            if (property.label.match(new RegExp('^R[0-9]*$'))) {
                getResource(property.label)
                    .catch(e => {
                        console.log(e);
                        setPredicateLabel(property.label.charAt(0).toUpperCase() + property.label.slice(1));
                    })
                    .then(r => {
                        setPredicateLabel(`${r.label.charAt(0).toUpperCase() + r.label.slice(1)} (${property.label})`);
                    });
            } else {
                setPredicateLabel(property.label.charAt(0).toUpperCase() + property.label.slice(1));
            }
        };
        getPredicateLabel();
    }, [property.label]);

    const handleDeleteStatement = useCallback(async () => {
        if (syncBackend) {
            // Delete All related statements
            if (property && property.valueIds.length > 0) {
                for (const valueId of property.valueIds) {
                    const value = values.byId[valueId];
                    deleteStatementById(value.statementId);
                }
                toast.success(`${property.valueIds.length} ${property.valueIds.length === 1 ? 'Statement' : 'Statements'} deleted successfully`);
            }
        }
        dispatch(
            deleteProperty({
                id: propertyId,
                resourceId: resourceId
            })
        );
    }, [dispatch, property, propertyId, resourceId, syncBackend, values.byId]);

    const changePredicate = useCallback(
        async newProperty => {
            if (syncBackend) {
                const predicate = property;
                const existingPredicateId = predicate ? predicate.existingPredicateId : false;
                if (existingPredicateId) {
                    const oldValues = predicate.valueIds;
                    for (const value of oldValues) {
                        await updateStatement(values.byId[value].statementId, { predicate_id: newProperty.id });
                    }
                    dispatch(changeProperty({ propertyId: propertyId, newProperty: newProperty }));
                    toast.success('Property updated successfully');
                }
            } else {
                dispatch(changeProperty({ propertyId: propertyId, newProperty: newProperty }));
            }
            dispatch(doneSavingProperty({ id: propertyId }));
        },
        [dispatch, property, propertyId, syncBackend, values.byId]
    );

    const handleChange = useCallback(
        async (selectedOption, a) => {
            // Check if the user changed the property
            if (predicateLabel !== selectedOption.label || property.existingPredicateId !== selectedOption.id) {
                dispatch(isSavingProperty({ id: propertyId })); // Show the saving message instead of the property label
                if (a.action === 'select-option') {
                    changePredicate({ ...selectedOption, isExistingProperty: true });
                } else if (a.action === 'create-option') {
                    let newPredicate = null;
                    if (syncBackend) {
                        newPredicate = await createPredicate(selectedOption.label);
                        newPredicate['isExistingProperty'] = true;
                    } else {
                        newPredicate = { id: guid(), label: selectedOption.label, isExistingProperty: false };
                    }
                    changePredicate(newPredicate);
                }
            }
        },
        [changePredicate, dispatch, predicateLabel, property.existingPredicateId, propertyId, syncBackend]
    );

    return { property, predicateLabel, handleChange, handleDeleteStatement };
}
export default useStatementItem;
