import { useState, useEffect } from 'react';
import { changeProperty, isSavingProperty, doneSavingProperty, deleteProperty } from 'actions/statementBrowser';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createPredicate } from 'services/backend/predicates';
import { getResource } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import StatementItemTemplate from './StatementItemTemplate';
import { guid } from 'utils';
import PropTypes from 'prop-types';

export default function StatementItem(props) {
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { selectedResource, properties, values } = statementBrowser;

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

    const handleDeleteStatement = async () => {
        const property = properties.byId[props.id];
        if (props.syncBackend) {
            // Delete All related statements
            if (property.valueIds.length > 0) {
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
    };

    const handleChange = async (selectedOption, a) => {
        const property = properties.byId[props.id];
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
    };

    const changePredicate = async newProperty => {
        if (props.syncBackend) {
            const predicate = properties.byId[props.id];
            const existingPredicateId = predicate ? predicate.existingPredicateId : false;
            if (existingPredicateId) {
                const values = predicate.valueIds;
                for (const value of values) {
                    await updateStatement(values.byId[value].statementId, { predicate_id: newProperty.id });
                }
                dispatch(changeProperty({ propertyId: props.id, newProperty: newProperty }));
                toast.success('Property updated successfully');
            }
        } else {
            dispatch(changeProperty({ propertyId: props.id, newProperty: newProperty }));
        }
        dispatch(doneSavingProperty({ id: props.id }));
    };

    return (
        <StatementItemTemplate
            property={props.property}
            id={props.id}
            isLastItem={props.isLastItem}
            enableEdit={props.enableEdit}
            predicateLabel={predicateLabel}
            values={values}
            syncBackend={props.syncBackend}
            handleChange={handleChange}
            inTemplate={props.inTemplate}
            showValueHelp={props.showValueHelp}
            handleDeleteStatement={handleDeleteStatement}
            resourceId={props.resourceId}
        />
    );
}

StatementItem.propTypes = {
    id: PropTypes.string.isRequired,
    property: PropTypes.object.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    showValueHelp: PropTypes.bool,
    resourceId: PropTypes.string,
    inTemplate: PropTypes.bool
};

StatementItem.defaultProps = {
    resourceId: null,
    showValueHelp: false
};
