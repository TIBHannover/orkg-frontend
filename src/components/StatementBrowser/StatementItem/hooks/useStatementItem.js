import { useState, useEffect, useCallback } from 'react';
import { changeProperty, isSavingProperty, doneSavingProperty, deleteProperty } from 'actions/statementBrowser';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createPredicate } from 'services/backend/predicates';
import { getResource } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';

function useStatementItem(props) {
    const dispatch = useDispatch();

    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const property = useSelector(state => state.statementBrowser.properties.byId[props.id]);
    const values = useSelector(state => state.statementBrowser.values);

    const [predicateLabel, setPredicateLabel] = useState(props.predicateLabel);

    useEffect(() => {
        const getPredicateLabel = () => {
            if (props.predicateLabel.match(new RegExp('^R[0-9]*$'))) {
                getResource(props.predicateLabel)
                    .catch(e => {
                        console.log(e);
                        setPredicateLabel(props.predicateLabel.charAt(0).toUpperCase() + props.predicateLabel.slice(1));
                    })
                    .then(r => {
                        setPredicateLabel(`${r.label.charAt(0).toUpperCase() + r.label.slice(1)} (${props.predicateLabel})`);
                    });
            } else {
                setPredicateLabel(props.predicateLabel.charAt(0).toUpperCase() + props.predicateLabel.slice(1));
            }
        };
        getPredicateLabel();
    }, [props.predicateLabel]);

    const handleDeleteStatement = useCallback(async () => {
        if (props.syncBackend) {
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
                id: props.id,
                resourceId: props.resourceId ? props.resourceId : selectedResource
            })
        );
    }, [dispatch, property, props.id, props.resourceId, props.syncBackend, selectedResource, values.byId]);

    const changePredicate = useCallback(
        async newProperty => {
            if (props.syncBackend) {
                const predicate = property;
                const existingPredicateId = predicate ? predicate.existingPredicateId : false;
                if (existingPredicateId) {
                    const oldValues = predicate.valueIds;
                    for (const value of oldValues) {
                        await updateStatement(values.byId[value].statementId, { predicate_id: newProperty.id });
                    }
                    dispatch(changeProperty({ propertyId: props.id, newProperty: newProperty }));
                    toast.success('Property updated successfully');
                }
            } else {
                dispatch(changeProperty({ propertyId: props.id, newProperty: newProperty }));
            }
            dispatch(doneSavingProperty({ id: props.id }));
        },
        [dispatch, property, props.id, props.syncBackend, values.byId]
    );

    const handleChange = useCallback(
        async (selectedOption, a) => {
            // Check if the user changed the property
            if (props.predicateLabel !== selectedOption.label || property.existingPredicateId !== selectedOption.id) {
                dispatch(isSavingProperty({ id: props.id })); // Show the saving message instead of the property label
                if (a.action === 'select-option') {
                    changePredicate({ ...selectedOption, isExistingProperty: true });
                } else if (a.action === 'create-option') {
                    let newPredicate = null;
                    if (props.syncBackend) {
                        newPredicate = await createPredicate(selectedOption.label);
                        newPredicate['isExistingProperty'] = true;
                    } else {
                        newPredicate = { id: guid(), label: selectedOption.label, isExistingProperty: false };
                    }
                    changePredicate(newPredicate);
                }
            }
        },
        [changePredicate, dispatch, property, props.id, props.predicateLabel, props.syncBackend]
    );

    return {
        predicateLabel,
        handleChange,
        handleDeleteStatement
    };
}
export default useStatementItem;
