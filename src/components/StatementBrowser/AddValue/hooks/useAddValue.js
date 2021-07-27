import { useState, useCallback } from 'react';
import {
    createValue,
    getComponentsByResourceIDAndPredicateID,
    fetchTemplatesOfClassIfNeeded,
    createRequiredPropertiesInResource,
    selectResource
} from 'actions/statementBrowser';
import { createResourceStatement } from 'services/backend/statements';
import { fillStatements } from 'actions/addPaper';
import { createLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import { createResource } from 'services/backend/resources';
import validationSchema from '../helpers/validationSchema';
import { getConfigByType } from 'constants/DataTypes';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';
import { getValueClass, isLiteral } from '../helpers/utils';
import { ENTITIES, CLASSES, MISC } from 'constants/graphSettings';

const useAddValue = ({ resourceId, propertyId, syncBackend }) => {
    const dispatch = useDispatch();
    const property = useSelector(state => state.statementBrowser.properties.byId[propertyId]);
    const valueClass = useSelector(state => getValueClass(getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId)));
    const isLiteralField = useSelector(state => isLiteral(getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId)));
    const isUniqLabel = valueClass && valueClass.id === CLASSES.PROBLEM ? true : false;
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);
    const [entityType, setEntityType] = useState(getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE)._class);
    const [inputValue, setInputValue] = useState('');
    const [inputDataType, setInputDataType] = useState(getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE).type);

    const schema = useSelector(state => {
        const components = getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId);
        if (valueClass && ['Date', 'Number', 'String'].includes(valueClass.id)) {
            let component;
            if (components && components.length > 0) {
                component = components[0];
            }
            if (!component) {
                component = {
                    value: valueClass,
                    property: { id: property.id, label: property.label },
                    validationRules: property.validationRules
                };
            }
            const schema = validationSchema(component);
            return schema;
        } else {
            const config = getConfigByType(inputDataType);
            return config.schema;
        }
    });

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

    /**
     * Get the correct xsd datatype if it's literal
     */
    const getDataType = () => {
        if (valueClass && entityType === 'literal') {
            switch (valueClass.id) {
                case 'String':
                    return MISC.DEFAULT_LITERAL_DATATYPE;
                case 'Number':
                    return 'xsd:decimal';
                case 'Date':
                    return 'xsd:date';
                default:
                    return MISC.DEFAULT_LITERAL_DATATYPE;
            }
        } else {
            return getConfigByType(inputDataType).type;
        }
    };

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

    const createBlankNode = entityType => {
        // is the valueType is literal, it's not possible to set it as an object of a statement
        // 1 - create a resource
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
            } else {
                dispatch(
                    selectResource({
                        increaseLevel: true,
                        resourceId: newResourceId,
                        label: isBlankNode,
                        propertyLabel: property.label
                    })
                );
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
            //create statements
            value.statements &&
                dispatch(
                    fillStatements({
                        statements: generateStatementsFromExternalData(value.statements),
                        resourceId: newEntity.id,
                        syncBackend: syncBackend
                    })
                );
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
            return newEntity.id ?? existingResourceId;
        },
        [dispatch, property?.existingPredicateId, propertyId, resourceId, syncBackend, valueClass]
    );

    return {
        modal,
        setModal,
        property,
        valueClass,
        isLiteralField,
        isBlankNode,
        isUniqLabel,
        inputDataType,
        inputValue,
        entityType,
        schema,
        getDataType,
        setInputDataType,
        setEntityType,
        setInputValue,
        handleAddValue,
        newResources,
        dialogResourceId,
        dialogResourceLabel,
        createBlankNode
    };
};

export default useAddValue;
