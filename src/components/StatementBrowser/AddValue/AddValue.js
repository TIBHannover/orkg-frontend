import React from 'react';
import { createValue, fetchTemplatesOfClassIfNeeded, selectResource, createRequiredPropertiesInResource } from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import { createResourceStatement, createLiteralStatement } from 'services/backend/statements';
import { createLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import { createResource } from 'services/backend/resources';
import AddValueTemplate from './AddValueTemplate';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';
import { isLiteral, getValueClass } from './helpers/utils';
import PropTypes from 'prop-types';
import { MISC } from 'constants/graphSettings';

const AddValue = props => {
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { selectedProperty, classes, properties, templates, openExistingResourcesInDialog } = statementBrowser;
    const selectedResource = useSelector(state => (props.resourceId ? props.resourceId : state.statementBrowser.selectedResource));
    const predicate = useSelector(state => state.statementBrowser.properties.byId[props.propertyId ? props.propertyId : selectedProperty]);
    const newResources = useSelector(state => {
        const newResourcesList = [];

        for (const key in state.statementBrowser.resources.byId) {
            const resource = state.statementBrowser.resources.byId[key];

            if (!resource.existingResourceId && resource.label && resource.id) {
                newResourcesList.push({
                    id: resource.id,
                    label: resource.label,
                    ...(resource.shared ? { shared: resource.shared } : {}),
                    ...(resource.classes ? { classes: resource.classes } : {})
                });
            }
        }
        return newResourcesList;
    });

    const valueClass = getValueClass(props.components);
    let isLiteralField = isLiteral(props.components);
    if (predicate.range) {
        isLiteralField = ['Date', 'Number', 'String'].includes(predicate.range.id) ? true : false;
    }

    /**
     * Create statements for a resource starting from an array of statements
     *
     * @param {Array} data array of statement
     * @return {Object} object of statements to use as an entry for prefillStatements action
     */
    const generateStatementsFromExternalData = data => {
        const statements = { properties: [], values: [] };
        const createdProperties = {};
        for (const statement of data) {
            const _propertyID = guid();
            if (!createdProperties[statement.predicate.id]) {
                createdProperties[statement.predicate.id] = _propertyID;
                statements['properties'].push({
                    propertyId: createdProperties[statement.predicate.id],
                    existingPredicateId: statement.predicate.id,
                    label: statement.predicate.label
                });
            }
            statements['values'].push({
                type: 'literal',
                propertyId: createdProperties[statement.predicate.id],
                label: statement.value.label
            });
        }
        return statements;
    };

    const handleValueSelect = async (valueType, { id, value, shared, classes, external, statements }) => {
        if (props.syncBackend) {
            if (external) {
                // create the object
                const newObject = await createResource(value, valueClass ? [valueClass.id] : []);
                const newStatement = await createResourceStatement(selectedResource, predicate.existingPredicateId, newObject.id);
                dispatch(
                    createValue({
                        label: value,
                        type: valueType,
                        propertyId: props.propertyId ? props.propertyId : selectedProperty,
                        existingResourceId: newObject.id,
                        isExistingValue: true,
                        statementId: newStatement.id,
                        shared: newObject.shared,
                        classes: valueClass ? [valueClass.id] : []
                    })
                );
                //create statements
                dispatch(
                    prefillStatements({
                        statements: generateStatementsFromExternalData(statements),
                        resourceId: newObject.id,
                        syncBackend: props.syncBackend
                    })
                );
            } else {
                const newStatement = await createResourceStatement(selectedResource, predicate.existingPredicateId, id);
                dispatch(
                    createValue({
                        label: value,
                        type: valueType,
                        propertyId: props.propertyId ? props.propertyId : selectedProperty,
                        classes: classes,
                        existingResourceId: id,
                        isExistingValue: true,
                        statementId: newStatement.id,
                        shared: shared
                    })
                );
            }
        } else {
            if (external) {
                const newObject = await handleAddValue(valueType, value, null);
                // create statements
                dispatch(
                    prefillStatements({
                        statements: generateStatementsFromExternalData(statements),
                        resourceId: newObject,
                        syncBackend: props.syncBackend
                    })
                );
            } else {
                dispatch(
                    createValue({
                        label: value,
                        type: valueType,
                        propertyId: props.propertyId ? props.propertyId : selectedProperty,
                        classes: classes,
                        existingResourceId: id,
                        isExistingValue: true,
                        shared: shared
                    })
                );
            }
        }
    };

    const handleAddValue = async (valueType, inputValue, datatype = MISC.DEFAULT_LITERAL_DATATYPE) => {
        let newObject = null;
        let newStatement = null;
        const valueId = guid();
        const existingResourceId = guid();
        if (props.syncBackend) {
            switch (valueType) {
                case 'object':
                    newObject = await createResource(inputValue, valueClass ? [valueClass.id] : []);
                    newStatement = await createResourceStatement(selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                case 'property':
                    newObject = await createPredicate(inputValue);
                    newStatement = await createResourceStatement(selectedResource, predicate.existingPredicateId, newObject.id);
                    break;
                default:
                    newObject = await createLiteral(inputValue, datatype);
                    newStatement = await createLiteralStatement(selectedResource, predicate.existingPredicateId, newObject.id);
            }
            dispatch(
                createValue({
                    label: inputValue,
                    type: valueType,
                    ...(valueType === 'literal' && { datatype: datatype }),
                    propertyId: props.propertyId ? props.propertyId : selectedProperty,
                    existingResourceId: newObject.id,
                    isExistingValue: true,
                    statementId: newStatement.id,
                    shared: newObject.shared,
                    classes: valueClass ? [valueClass.id] : []
                })
            );
        } else {
            dispatch(
                createValue({
                    valueId,
                    label: inputValue,
                    type: valueType,
                    ...(valueType === 'literal' && { datatype: datatype }),
                    propertyId: props.propertyId ? props.propertyId : selectedProperty,
                    existingResourceId,
                    isExistingValue: false,
                    classes: valueClass ? [valueClass.id] : [],
                    shared: 1
                })
            );
        }
        return newObject ? newObject.id : existingResourceId;
    };

    return (
        <AddValueTemplate
            predicate={predicate}
            properties={properties}
            propertyId={props.propertyId}
            selectedProperty={selectedProperty}
            handleValueSelect={(valueType, inputValue) => handleValueSelect(valueType, inputValue)}
            newResources={newResources}
            handleAddValue={handleAddValue}
            fetchTemplatesOfClassIfNeeded={ClassID => dispatch(fetchTemplatesOfClassIfNeeded(ClassID))}
            components={props.components}
            classes={classes}
            templates={templates}
            selectResource={dispatch(selectResource)}
            openExistingResourcesInDialog={openExistingResourcesInDialog}
            isDisabled={props.isDisabled}
            createRequiredPropertiesInResource={dispatch(createRequiredPropertiesInResource)}
            isLiteral={isLiteralField}
            valueClass={valueClass}
        />
    );
};

AddValue.propTypes = {
    propertyId: PropTypes.string,
    resourceId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    components: PropTypes.array.isRequired,
    isDisabled: PropTypes.bool.isRequired
};

AddValue.defaultProps = {
    isDisabled: false
};

export default AddValue;
