import { useState, useEffect, useCallback } from 'react';
import {
    changeProperty,
    deleteProperty,
    setIsSavingProperty,
    setIsDeletingProperty,
    canAddValue as canAddValueAction,
    canDeleteProperty as canDeletePropertyAction,
} from 'slices/statementBrowserSlice';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createPredicate } from 'services/backend/predicates';
import { getResource } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';
import classNames from 'classnames';

function useStatementItem({ propertyId, resourceId, syncBackend }) {
    const dispatch = useDispatch();
    const property = useSelector(state => state.statementBrowser.properties.byId[propertyId]);
    const values = useSelector(state => state.statementBrowser.values);
    const [predicateLabel, setPredicateLabel] = useState(property.label);

    const canAddValue = useSelector(state => canAddValueAction(state, resourceId || state.statementBrowser.selectedResource, propertyId));
    const canDeleteProperty = useSelector(state => canDeletePropertyAction(state, resourceId || state.statementBrowser.selectedResource, propertyId));
    const propertiesAsLinks = useSelector(state => state.statementBrowser.propertiesAsLinks);

    const propertyOptionsClasses = classNames({
        propertyOptions: true,
    });

    useEffect(() => {
        const getPredicateLabel = () => {
            if (property.label.match(new RegExp('^R[0-9]*$'))) {
                getResource(property.label)
                    .catch(e => {
                        console.log(e);
                        setPredicateLabel(property.label);
                    })
                    .then(r => {
                        setPredicateLabel(`${r.label} (${property.label})`);
                    });
            } else {
                setPredicateLabel(property.label);
            }
        };
        getPredicateLabel();
    }, [property.label]);

    const handleDeleteStatement = useCallback(async () => {
        if (syncBackend) {
            // Delete All related statements
            if (property && property.valueIds.length > 0) {
                const apiCalls = [];
                dispatch(setIsDeletingProperty({ id: propertyId, status: true }));
                for (const valueId of property.valueIds) {
                    const value = values.byId[valueId];
                    apiCalls.push(deleteStatementById(value.statementId));
                }
                Promise.all(apiCalls)
                    .then(() => {
                        dispatch(setIsDeletingProperty({ id: propertyId, status: false }));
                        dispatch(
                            deleteProperty({
                                id: propertyId,
                                resourceId,
                            }),
                        );
                        toast.success(
                            `${property.valueIds.length} ${property.valueIds.length === 1 ? 'Statement' : 'Statements'} deleted successfully`,
                        );
                    })
                    .catch(e => {
                        dispatch(setIsDeletingProperty({ id: propertyId, status: false }));
                        toast.error(`Something went wrong while deleting the ${property.valueIds.length === 1 ? 'statement' : 'statements'}.`);
                    });
            } else {
                dispatch(
                    deleteProperty({
                        id: propertyId,
                        resourceId,
                    }),
                );
            }
        } else {
            dispatch(
                deleteProperty({
                    id: propertyId,
                    resourceId,
                }),
            );
        }
    }, [dispatch, property, propertyId, resourceId, syncBackend, values.byId]);

    const changePredicate = useCallback(
        async newProperty => {
            dispatch(setIsSavingProperty({ id: propertyId, status: true }));
            if (syncBackend) {
                const predicate = property;
                const apiCalls = [];
                const oldValues = predicate.valueIds;
                for (const value of oldValues) {
                    apiCalls.push(updateStatement(values.byId[value].statementId, { predicate_id: newProperty.id }));
                }
                Promise.all(apiCalls)
                    .then(() => {
                        dispatch(changeProperty({ propertyId, newProperty }));
                        toast.success('Property changed successfully');
                        dispatch(setIsSavingProperty({ id: propertyId, status: false }));
                    })
                    .catch(() => {
                        toast.error('Something went wrong while changing the property');
                        dispatch(setIsSavingProperty({ id: propertyId, status: false }));
                    });
            } else {
                dispatch(changeProperty({ propertyId, newProperty }));
                dispatch(setIsSavingProperty({ id: propertyId, status: false }));
            }
        },
        [dispatch, property, propertyId, syncBackend, values.byId],
    );

    const handleChange = useCallback(
        async (selectedOption, a) => {
            // Check if the user changed the property
            if (predicateLabel !== selectedOption.label || property.existingPredicateId !== selectedOption.id) {
                dispatch(setIsSavingProperty({ id: propertyId, status: true })); // Show the saving message instead of the property label
                if (a.action === 'select-option') {
                    changePredicate({ ...selectedOption, isExistingProperty: true });
                } else if (a.action === 'create-option') {
                    let newPredicate = null;
                    if (syncBackend) {
                        newPredicate = await createPredicate(selectedOption.label);
                        newPredicate.isExistingProperty = true;
                    } else {
                        newPredicate = { id: guid(), label: selectedOption.label, isExistingProperty: false };
                    }
                    changePredicate(newPredicate);
                }
            }
        },
        [changePredicate, dispatch, predicateLabel, property.existingPredicateId, propertyId, syncBackend],
    );

    return {
        propertiesAsLinks,
        propertyOptionsClasses,
        canDeleteProperty,
        dispatch,
        values,
        canAddValue,
        property,
        predicateLabel,
        handleChange,
        handleDeleteStatement,
    };
}
export default useStatementItem;
