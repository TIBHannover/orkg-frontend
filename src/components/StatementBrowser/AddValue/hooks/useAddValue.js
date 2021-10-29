import { useState, useCallback } from 'react';
import {
    createValue,
    getComponentsByResourceIDAndPredicateID,
    fetchTemplatesOfClassIfNeeded,
    createRequiredPropertiesInResource,
    selectResource,
    getValueClass,
    isLiteral,
    isAddingValue,
    doneAddingValue,
    fillStatements
} from 'actions/statementBrowser';
import { createResourceStatement } from 'services/backend/statements';
import { createLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import { createResource } from 'services/backend/resources';
import { getConfigByType } from 'constants/DataTypes';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';
import { ENTITIES, MISC } from 'constants/graphSettings';

const useAddValue = ({ resourceId, propertyId, syncBackend }) => {
    const dispatch = useDispatch();
    const property = useSelector(state => state.statementBrowser.properties.byId[propertyId]);
    const valueClass = useSelector(state => getValueClass(getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId)));
    const isLiteralField = useSelector(state => isLiteral(getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId)));
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);
    const [entityType] = useState(getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE)._class);
    const [, setInputValue] = useState('');

    if (valueClass) {
        dispatch(fetchTemplatesOfClassIfNeeded(valueClass.id));
    }
    const isBlankNode = useSelector(state => {
        if (valueClass && !isLiteralField) {
            if (state.statementBrowser.classes[valueClass.id]?.templateIds) {
                const templateIds = state.statementBrowser.classes[valueClass.id].templateIds;
                //check if it's an inline resource
                for (const templateId of templateIds) {
                    const template = state.statementBrowser.templates[templateId];
                    if (template && template.hasLabelFormat) {
                        return template.label;
                    }
                }
                if (!state.statementBrowser.classes[valueClass.id].isFetching) {
                    // in case there is no templates for the class
                    return false;
                }
            }
        } else {
            return false;
        }
    });

    /**
     * Create statements for a resource starting from an array of statements
     *
     * @param {Array} data array of statement
     * @return {Object} object of statements to use as an entry for fillStatements action
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

    const createBlankNode = () => {
        // is the valueType is literal, it's not possible to set it as an object of a statement
        // 1 - create a resource
        dispatch(isAddingValue({ id: propertyId }));
        handleAddValue(ENTITIES.RESOURCE, { label: isBlankNode, shared: 0 }).then(newResourceId => {
            // 2 - open the dialog on that resource
            if (openExistingResourcesInDialog) {
                dispatch(
                    createRequiredPropertiesInResource(newResourceId).then(() => {
                        setDialogResourceId(newResourceId);
                        setDialogResourceLabel(isBlankNode);
                        setModal(true);
                    })
                );
                dispatch(doneAddingValue({ id: propertyId }));
            } else {
                dispatch(
                    selectResource({
                        increaseLevel: true,
                        resourceId: newResourceId,
                        label: isBlankNode,
                        propertyLabel: property.label
                    })
                );
                dispatch(doneAddingValue({ id: propertyId }));
            }
        });
    };

    /**
     * When the user select a value from the autocomplete
     * @param {String} entityType The entity type (resource|predicate|literal|class)
     * @param {Object} value - The selected value
     * @param {String} value.id - ID of entity
     * @param {String} value.label - Label of entity
     * @param {Integer} value.shared - Number of incoming links
     * @param {String[]} value.classes - List of classes IDs
     * @param {String?} value.datatype - Literal datatype
     * @param {Boolean} value.external - If the value is coming from external resource (eg: GeoNames API)
     * @param {string} value.statements - Statement to create after adding the value (e.g when we create a new location from GeoNames we have to add url of that resource)
     */
    const handleAddValue = useCallback(
        async (entityType, value) => {
            let newEntity = { id: value.id, label: value.label, shared: value.shared, classes: value.classes, datatype: value.datatype };
            let newStatement = null;
            const existingResourceId = guid();
            if (syncBackend) {
                switch (entityType) {
                    case ENTITIES.RESOURCE:
                        newEntity = await createResource(value.label, valueClass ? [valueClass.id] : []);
                        break;
                    case ENTITIES.PREDICATE:
                        newEntity = await createPredicate(value.label);
                        break;
                    case ENTITIES.LITERAL:
                        newEntity = await createLiteral(value.label, value.datatype);
                        break;
                    default:
                        newEntity = await createLiteral(value.label, value.datatype);
                }
                newStatement = await createResourceStatement(resourceId, property?.existingPredicateId, newEntity.id);
            }

            dispatch(
                createValue({
                    ...newEntity,
                    //valueId: newEntity.id ?? existingResourceId,
                    classes: newEntity.classes ?? (valueClass ? [valueClass?.id] : []),
                    _class: entityType,
                    propertyId: propertyId,
                    existingResourceId: newEntity.id ?? existingResourceId,
                    isExistingValue: newEntity.id ? true : false,
                    statementId: newStatement?.id
                })
            );
            //create statements
            value.statements &&
                dispatch(
                    fillStatements({
                        statements: generateStatementsFromExternalData(value.statements),
                        resourceId: newEntity.id ?? existingResourceId,
                        syncBackend: syncBackend
                    })
                );
            return newEntity.id ?? existingResourceId;
        },
        [dispatch, property?.existingPredicateId, propertyId, resourceId, syncBackend, valueClass]
    );

    return {
        modal,
        setModal,
        isBlankNode,
        entityType,
        setInputValue,
        dialogResourceId,
        dialogResourceLabel,
        createBlankNode
    };
};

export default useAddValue;
