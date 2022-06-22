import { useState, useCallback } from 'react';
import {
    createValueAction as createValue,
    getComponentsByResourceIDAndPredicateID,
    fetchTemplatesOfClassIfNeeded,
    getValueClass,
    isLiteral,
    fillStatements,
    getSubjectIdByValue,
    setIsAddingValue,
    setSavingValue,
    updateValueLabel,
} from 'slices/statementBrowserSlice';
import { createResourceStatement } from 'services/backend/statements';
import { createResource, updateResource } from 'services/backend/resources';
import { createLiteral, updateLiteral } from 'services/backend/literals';
import { createClass } from 'services/backend/classes';
import { createPredicate } from 'services/backend/predicates';
import { getConfigByType, getConfigByClassId } from 'constants/DataTypes';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';
import { toast } from 'react-toastify';
import { ENTITIES, CLASSES, MISC } from 'constants/graphSettings';
import validationSchema from '../helpers/validationSchema';

const useValueForm = ({ valueId, resourceId, propertyId, syncBackend }) => {
    const dispatch = useDispatch();
    const editMode = Boolean(valueId);
    const value = useSelector(state => (valueId ? state.statementBrowser.values.byId[valueId] : null));
    const property = useSelector(state => state.statementBrowser.properties.byId[editMode ? value.propertyId : propertyId]);
    const subjectId = useSelector(state => (editMode ? getSubjectIdByValue(state, valueId) : resourceId));
    // refactoring: Can be replaced with the id class
    const valueClass = useSelector(state => getValueClass(getComponentsByResourceIDAndPredicateID(state, subjectId, property?.existingPredicateId)));
    const isLiteralField = useSelector(state =>
        editMode
            ? value._class === ENTITIES.LITERAL
            : isLiteral(getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId)),
    );
    const isUniqLabel = !!(valueClass && valueClass.id === CLASSES.PROBLEM);

    const [entityType, setEntityType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE)._class
            : getConfigByClassId(valueClass.id)._class,
    );

    const [inputValue, setInputValue] = useState(editMode ? value.label : '');
    const [inputDataType, setInputDataType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? (editMode ? value.datatype : MISC.DEFAULT_LITERAL_DATATYPE) : ENTITIES.RESOURCE).type
            : getConfigByClassId(valueClass.id).type,
    );
    const [disabledCreate, setDisabledCreate] = useState(false);

    const commitChangeLabel = async (draftLabel, draftDataType) => {
        // Check if the user changed the label
        if (draftLabel !== value.label || draftDataType !== value.datatype) {
            if (syncBackend) {
                dispatch(setSavingValue({ id: valueId, status: true })); // To show the saving message instead of the value label
                if (value.resourceId) {
                    const apiCall =
                        value._class === ENTITIES.LITERAL
                            ? updateLiteral(value.resourceId, draftLabel, draftDataType)
                            : updateResource(value.resourceId, draftLabel);
                    apiCall
                        .then(() => {
                            toast.success(`${value._class === ENTITIES.LITERAL ? 'Literal' : 'Resource'} label updated successfully`);
                            dispatch(setSavingValue({ id: valueId, status: false }));
                        })
                        .catch(() => {
                            toast.error('Something went wrong while updating the label.');
                            dispatch(setSavingValue({ id: valueId, status: false }));
                        });
                }
            }
            dispatch(
                updateValueLabel({
                    label: draftLabel,
                    datatype: draftDataType,
                    valueId,
                }),
            );
        }
    };

    const schema = useSelector(state => {
        const components = getComponentsByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId);
        if (valueClass && [CLASSES.DATE, CLASSES.DECIMAL, CLASSES.STRING, CLASSES.BOOLEAN, CLASSES.INTEGER, CLASSES.URI].includes(valueClass.id)) {
            let component;
            if (components && components.length > 0) {
                component = components[0];
            }
            if (!component) {
                component = {
                    value: valueClass,
                    property: { id: property.id, label: property.label },
                    validationRules: property.validationRules,
                };
            }
            const schema = validationSchema(component);
            return schema;
        }
        const config = getConfigByType(inputDataType);
        return config.schema;
    });

    if (valueClass) {
        dispatch(fetchTemplatesOfClassIfNeeded(valueClass.id));
    }

    const isBlankNode = useSelector(state => {
        if (valueClass && !isLiteralField) {
            if (state.statementBrowser.classes[valueClass.id]?.templateIds) {
                const { templateIds } = state.statementBrowser.classes[valueClass.id];
                // check if it's an inline resource
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

            if (!resource.existingResourceId && resource.label && resource.resourceId) {
                newResourcesList.push({
                    id: resource.resourceId,
                    label: resource.label,
                    ...(resource.shared ? { shared: resource.shared } : {}),
                    ...(resource.classes ? { classes: resource.classes } : {}),
                    existingResourceId: true,
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
                case CLASSES.STRING:
                    return MISC.DEFAULT_LITERAL_DATATYPE;
                case CLASSES.DECIMAL:
                    return 'xsd:decimal';
                case CLASSES.INTEGER:
                    return 'xsd:integer';
                case CLASSES.DATE:
                    return 'xsd:date';
                case CLASSES.BOOLEAN:
                    return 'xsd:boolean';
                case CLASSES.URI:
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
                statements.properties.push({
                    propertyId: createdProperties[statement.predicate.id],
                    existingPredicateId: statement.predicate.id,
                    label: statement.predicate.label,
                });
            }
            statements.values.push({
                _class: statement.value._class,
                propertyId: createdProperties[statement.predicate.id],
                label: statement.value.label,
                datatype: statement.value.datatype,
            });
        }
        return statements;
    };

    /**
     * When the user select a value from the autocomplete
     *
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
            let apiError = false;
            const existingResourceId = guid();
            if (syncBackend) {
                dispatch(setIsAddingValue({ id: propertyId, status: true }));
                let apiCall;
                if (!value.selected || value.external) {
                    switch (entityType) {
                        case ENTITIES.RESOURCE:
                            apiCall = createResource(value.label, valueClass ? [valueClass.id] : []);
                            break;
                        case ENTITIES.PREDICATE:
                            apiCall = createPredicate(value.label);
                            break;
                        case ENTITIES.LITERAL:
                            apiCall = createLiteral(value.label, value.datatype);
                            break;
                        case ENTITIES.CLASS:
                            apiCall = createClass(value.label);
                            break;
                        default:
                            apiCall = createLiteral(value.label, value.datatype);
                    }
                } else {
                    apiCall = Promise.resolve(newEntity);
                }
                await apiCall
                    .then(response => {
                        newEntity = response;
                        return createResourceStatement(resourceId, property?.existingPredicateId, newEntity.id);
                    })
                    .then(newS => {
                        newStatement = newS;
                    })
                    .catch(() => {
                        apiError = true;
                        toast.error('Something went wrong while adding the value.');
                        dispatch(setIsAddingValue({ id: propertyId, status: false }));
                    });
            }
            if (!apiError) {
                dispatch(
                    createValue({
                        ...newEntity,
                        // valueId: newEntity.id ?? existingResourceId,
                        classes: newEntity.classes ?? (valueClass ? [valueClass?.id] : []),
                        _class: entityType,
                        propertyId,
                        existingResourceId: newEntity.id ?? existingResourceId,
                        isExistingValue: !!newEntity.id,
                        statementId: newStatement?.id,
                    }),
                );
                // create statements
                value.statements &&
                    (await dispatch(
                        fillStatements({
                            statements: generateStatementsFromExternalData(value.statements),
                            resourceId: newEntity.id ?? existingResourceId,
                            syncBackend,
                        }),
                    ));
                dispatch(setIsAddingValue({ id: propertyId, status: false }));
                return newEntity.id ?? existingResourceId;
            }
        },
        [dispatch, property?.existingPredicateId, propertyId, resourceId, syncBackend, valueClass],
    );

    const handleCreateExistingLabel = (inputValue, selectOptions) => {
        // check if label exists
        if (
            isUniqLabel &&
            inputValue &&
            selectOptions
                .map(s =>
                    String(s.label)
                        .trim()
                        .toLowerCase(),
                )
                .includes(
                    String(inputValue)
                        .trim()
                        .toLowerCase(),
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
        commitChangeLabel,
    };
};

export default useValueForm;
