import { useState, useCallback } from 'react';
import {
    createValue,
    getComponentsByResourceIDAndPredicateID,
    fetchTemplatesOfClassIfNeeded,
    getValueClass,
    isLiteral,
    updateValueLabel,
    doneSavingValue,
    isSavingValue
} from 'actions/statementBrowser';
import { createResourceStatement } from 'services/backend/statements';
import { createResource, updateResource } from 'services/backend/resources';
import { createLiteral, updateLiteral } from 'services/backend/literals';
import { createClass } from 'services/backend/classes';
import { fillStatements } from 'actions/addPaper';
import { createPredicate } from 'services/backend/predicates';
import validationSchema from '../helpers/validationSchema';
import { getConfigByType, getConfigByClassId } from 'constants/DataTypes';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';
import { toast } from 'react-toastify';
import { ENTITIES, CLASSES, MISC } from 'constants/graphSettings';

const useValueForm = ({ valueId, resourceId, propertyId, syncBackend }) => {
    const dispatch = useDispatch();
    const editMode = Boolean(valueId);
    const value = useSelector(state => (valueId ? state.statementBrowser.values.byId[valueId] : null));
    const property = useSelector(state => state.statementBrowser.properties.byId[editMode ? value.propertyId : propertyId]);
    const subjectId = editMode ? value.resourceId : resourceId;
    const valueClass = useSelector(state =>
        editMode ? value.classes?.[0] : getValueClass(getComponentsByResourceIDAndPredicateID(state, subjectId, property?.existingPredicateId))
    );

    const isLiteralField = useSelector(state =>
        editMode
            ? value._class === ENTITIES.LITERAL
            : isLiteral(getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId))
    );
    const isUniqLabel = valueClass && valueClass.id === CLASSES.PROBLEM ? true : false;

    const [entityType, setEntityType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE)._class
            : getConfigByClassId(valueClass.id)._class
    );

    const [inputValue, setInputValue] = useState(editMode ? value.label : '');
    const [inputDataType, setInputDataType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? (editMode ? value.datatype : MISC.DEFAULT_LITERAL_DATATYPE) : ENTITIES.RESOURCE).type
            : getConfigByClassId(valueClass.id).type
    );
    const [disabledCreate, setDisabledCreate] = useState(false);

    const commitChangeLabel = async (draftLabel, draftDataType) => {
        // Check if the user changed the label
        if (draftLabel !== value.label || draftDataType !== value.datatype) {
            dispatch(
                updateValueLabel({
                    label: draftLabel,
                    datatype: draftDataType,
                    valueId: valueId
                })
            );
            if (syncBackend) {
                dispatch(isSavingValue({ id: valueId })); // To show the saving message instead of the value label
                if (value.resourceId) {
                    if (value._class === ENTITIES.LITERAL) {
                        await updateLiteral(value.resourceId, draftLabel, draftDataType);
                        toast.success('Literal updated successfully');
                    } else {
                        await updateResource(value.resourceId, draftLabel);
                        toast.success('Resource label updated successfully');
                    }
                }
                dispatch(doneSavingValue({ id: valueId }));
            }
        }
    };

    const schema = useSelector(state => {
        const components = getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId);
        if (valueClass && ['Date', 'Number', 'String', 'Boolean', 'Integer', 'URI'].includes(valueClass.id)) {
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
        if (valueClass && entityType === ENTITIES.LITERAL) {
            switch (valueClass.id) {
                case 'String':
                    return MISC.DEFAULT_LITERAL_DATATYPE;
                case 'Number':
                    return 'xsd:decimal';
                case 'Integer':
                    return 'xsd:integer';
                case 'Date':
                    return 'xsd:date';
                case 'Boolean':
                    return 'xsd:boolean';
                case 'URI':
                    return 'xsd:anyURI';
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
                if (!value.selected) {
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
                        case ENTITIES.CLASS:
                            newEntity = await createClass(value.label);
                            break;
                        default:
                            newEntity = await createLiteral(value.label, value.datatype);
                    }
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

    const handleCreateExistingLabel = (inputValue, selectOptions) => {
        //check if label exists
        if (
            isUniqLabel &&
            inputValue &&
            selectOptions
                .map(s =>
                    String(s.label)
                        .trim()
                        .toLowerCase()
                )
                .includes(
                    String(inputValue)
                        .trim()
                        .toLowerCase()
                )
        ) {
            setDisabledCreate(true);
        } else {
            setDisabledCreate(false);
        }
    };

    return {
        value,
        property,
        valueClass,
        isLiteralField,
        isBlankNode,
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
        disabledCreate,
        handleCreateExistingLabel,
        commitChangeLabel
    };
};

export default useValueForm;
