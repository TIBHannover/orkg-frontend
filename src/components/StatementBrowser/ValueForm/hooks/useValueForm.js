import validationSchema from 'components/StatementBrowser/ValueForm/helpers/validationSchema';
import { getConfigByClassId, getConfigByType } from 'constants/DataTypes';
import { CLASSES, ENTITIES, MISC, PREDICATES, RESOURCES } from 'constants/graphSettings';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createClass } from 'services/backend/classes';
import { createList, updateList } from 'services/backend/lists';
import { createLiteral, updateLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import { createResource, getResource, updateResource } from 'services/backend/resources';
import { createResourceStatement, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import {
    checkIfIsList,
    createValueAction as createValue,
    fetchTemplatesOfClassIfNeeded,
    fillStatements,
    getPropertyShapesByResourceIDAndPredicateID,
    getSubjectIdByValue,
    getValueClass,
    isLiteral,
    setIsAddingValue,
    setSavingValue,
    updateValueLabel,
} from 'slices/statementBrowserSlice';
import { guid } from 'utils';

const useValueForm = ({ valueId, resourceId, propertyId, syncBackend }) => {
    const dispatch = useDispatch();
    const editMode = Boolean(valueId);
    const value = useSelector((state) => (valueId ? state.statementBrowser.values.byId[valueId] : null));
    const property = useSelector((state) => state.statementBrowser.properties.byId[editMode ? value.propertyId : propertyId]);
    const values = useSelector((state) => state.statementBrowser.values);
    const subjectId = useSelector((state) => (editMode ? getSubjectIdByValue(state, valueId) : resourceId));
    const isList = useSelector((state) => checkIfIsList({ state, propertyId }));
    const propertyShape = useSelector((state) => getPropertyShapesByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId)?.[0]);

    // refactoring: Can be replaced with the id class
    const valueClass = useSelector((state) =>
        getValueClass(getPropertyShapesByResourceIDAndPredicateID(state, subjectId, property?.existingPredicateId)),
    );
    const isLiteralField = useSelector((state) =>
        editMode
            ? value._class === ENTITIES.LITERAL
            : isLiteral(getPropertyShapesByResourceIDAndPredicateID(state, resourceId, property?.existingPredicateId)),
    );
    const isUniqLabel = !!(valueClass && valueClass.id === CLASSES.PROBLEM);

    const [entityType, setEntityType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE)._class
            : getConfigByClassId(valueClass.id)._class,
    );

    const [inputFormType, setInputFormType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE).inputFormType
            : getConfigByClassId(valueClass.id).inputFormType,
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
            const sync = !syncBackend ? !!value.id : syncBackend;
            if (sync) {
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
                            // TODO: Differentiate between values saved in the database and new values
                            if (sync === syncBackend) toast.error('Something went wrong while updating the label.');
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

    const schema = useSelector((state) => {
        const propertyShapes = getPropertyShapesByResourceIDAndPredicateID(state, subjectId, property?.existingPredicateId);
        if (valueClass && [CLASSES.DATE, CLASSES.DECIMAL, CLASSES.STRING, CLASSES.BOOLEAN, CLASSES.INTEGER, CLASSES.URI].includes(valueClass.id)) {
            let propertyShape;
            if (propertyShapes && propertyShapes.length > 0) {
                propertyShape = propertyShapes[0];
            }
            if (!propertyShape) {
                propertyShape = {
                    datatype: valueClass,
                    path: { id: property.id, label: property.label },
                    min_inclusive: property.min_inclusive,
                    max_inclusive: property.max_inclusive,
                    pattern: property.pattern,
                };
            }
            const schema = validationSchema(propertyShape);
            return schema;
        }
        const config = getConfigByType(inputDataType);
        return config.schema;
    });

    if (valueClass) {
        dispatch(fetchTemplatesOfClassIfNeeded(valueClass.id));
    }

    const isBlankNode = useSelector((state) => {
        if (valueClass && !isLiteralField) {
            if (state.statementBrowser.classes[valueClass.id]?.templateIds) {
                const { templateIds } = state.statementBrowser.classes[valueClass.id];
                // check if it's an inline resource
                for (const templateId of templateIds) {
                    const template = state.statementBrowser.templates[templateId];
                    if (template && !!template.formatted_label) {
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

    const newResources = useSelector((state) => {
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
    const generateStatementsFromExternalData = (data) => {
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
            let _class = entityType;
            let newEntity = { id: value.id, label: value.label, shared: value.shared ?? 0, classes: value.classes, datatype: value.datatype };
            let newStatement = null;
            let apiError = false;
            const existingResourceId = guid();
            if (syncBackend) {
                dispatch(setIsAddingValue({ id: propertyId, status: true }));
                let apiCall;
                if (!value.selected || value.external) {
                    switch (entityType) {
                        case ENTITIES.RESOURCE:
                            if (newEntity.datatype === 'list') {
                                apiCall = createList({ label: value.label });
                            } else {
                                apiCall = createResource(value.label, valueClass ? [valueClass.id] : []);
                            }
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
                        case 'empty':
                            apiCall = getResource(RESOURCES.EMPTY_RESOURCE);
                            _class = ENTITIES.RESOURCE;
                            break;
                        default:
                            apiCall = createLiteral(value.label, value.datatype);
                    }
                } else {
                    apiCall = Promise.resolve(newEntity);
                }
                await apiCall
                    .then(async (response) => {
                        newEntity = response;
                        if (isList) {
                            await updateList({
                                id: resourceId,
                                elements: [...property.valueIds.map((id) => values.byId[id].resourceId), newEntity.id],
                            });
                            // fetch the just created statement to get the ID (the statement ID is not returned when updating the list)
                            // this method might fail if in the mean time another statement is created
                            const statements = await getStatementsBySubjectAndPredicate({
                                subjectId: resourceId,
                                predicateId: PREDICATES.HAS_LIST_ELEMENT,
                                page: 0,
                                size: 1,
                                sortBy: 'created_at',
                                desc: true,
                            });
                            return statements?.[0];
                        }
                        return createResourceStatement(resourceId, property?.existingPredicateId, newEntity.id);
                    })
                    .then((newS) => {
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
                        _class,
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

    const handleCreateExistingLabel = (inputValue, selectValue, selectOptions) => {
        // check if label exists
        if (
            isUniqLabel &&
            inputValue &&
            selectOptions.map((s) => String(s.label).trim().toLowerCase()).includes(String(inputValue).trim().toLowerCase())
        ) {
            setDisabledCreate(true);
        } else {
            setDisabledCreate(false);
        }
    };

    return {
        propertyShape,
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
        inputFormType,
        setInputFormType,
    };
};

export default useValueForm;
