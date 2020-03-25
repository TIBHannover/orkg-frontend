import React, { useState, useEffect } from 'react';
import { getResource, predicatesUrl, submitGetRequest, updateStatement, createPredicate, deleteStatementById } from 'network';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import StatementItemSB from './StatementItemSB';
import StatementItemTemplate from './StatementItemTemplate';
import { guid } from 'utils';

export default function StatementItem(props) {
    const [predicateLabel, setPredicateLabel] = useState(props.predicateLabel);
    const maxResults = 15;
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
        const property = props.properties.byId[props.id];
        if (props.syncBackend) {
            // Delete All related statements
            if (property.valueIds.length > 0) {
                for (const valueId of property.valueIds) {
                    const value = props.values.byId[valueId];
                    deleteStatementById(value.statementId);
                }
                toast.success(`${property.valueIds.length} ${property.valueIds.length === 1 ? 'Statement' : 'Statements'} deleted successfully`);
            }
        }
        props.deleteProperty({
            id: props.id,
            resourceId: props.resourceId ? props.resourceId : props.selectedResource
        });
    };

    const handleChange = async (selectedOption, a) => {
        const property = props.properties.byId[props.id];
        // Check if the user changed the property
        if (props.predicateLabel !== selectedOption.label || property.existingPredicateId !== selectedOption.id) {
            props.isSavingProperty({ id: props.id }); // Show the saving message instead of the property label
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
            const predicate = props.properties.byId[props.id];
            const existingPredicateId = predicate ? predicate.existingPredicateId : false;
            if (existingPredicateId) {
                const values = predicate.valueIds;
                for (const value of values) {
                    await updateStatement(props.values.byId[value].statementId, { predicate_id: newProperty.id });
                }
                props.changeProperty({ propertyId: props.id, newProperty: newProperty });
                toast.success('Property updated successfully');
            }
        } else {
            props.changeProperty({ propertyId: props.id, newProperty: newProperty });
        }
        props.doneSavingProperty({ id: props.id });
    };

    const IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(predicatesUrl + encodeURIComponent(valueWithoutHashtag));
                } catch (err) {
                    responseJsonExact = null;
                }

                if (responseJsonExact) {
                    responseJson.unshift(responseJsonExact);
                }
            }
        }

        return responseJson;
    };

    const loadOptions = async value => {
        try {
            let queryParams = '';

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1);
                queryParams = '&exact=true';
            }

            let responseJson = await submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(value) + queryParams);
            responseJson = await IdMatch(value, responseJson);

            if (responseJson.length > maxResults) {
                responseJson = responseJson.slice(0, maxResults);
            }

            const options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id
                })
            );

            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    };

    return (
        <StatementItemTemplate
            togglePropertyCollapse={props.togglePropertyCollapse}
            property={props.property}
            id={props.id}
            selectedProperty={props.selectedProperty}
            isLastItem={props.isLastItem}
            enableEdit={props.enableEdit}
            loadOptions={loadOptions}
            predicateLabel={predicateLabel}
            values={props.values}
            syncBackend={props.syncBackend}
            handleChange={handleChange}
            toggleEditPropertyLabel={props.toggleEditPropertyLabel}
            inTemplate={props.inTemplate}
            showValueHelp={props.showValueHelp}
            openExistingResourcesInDialog={props.openExistingResourcesInDialog}
            handleDeleteStatement={handleDeleteStatement}
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
    openExistingResourcesInDialog: PropTypes.bool,
    showValueHelp: PropTypes.bool,

    contextStyle: PropTypes.string.isRequired,
    resourceId: PropTypes.string,
    inTemplate: PropTypes.bool,

    selectedProperty: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    deleteProperty: PropTypes.func.isRequired,
    togglePropertyCollapse: PropTypes.func.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    changeProperty: PropTypes.func.isRequired,
    isSavingProperty: PropTypes.func.isRequired,
    doneSavingProperty: PropTypes.func.isRequired
};

StatementItem.defaultProps = {
    resourceId: null,
    contextStyle: 'StatementBrowser',
    showValueHelp: false
};
