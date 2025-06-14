import { createSlice } from '@reduxjs/toolkit';
import { flatten, intersection, uniq, uniqBy } from 'lodash';
import { toast } from 'react-toastify';
import format from 'string-format';

import { LOCATION_CHANGE } from '@/components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import DATA_TYPES from '@/constants/DataTypes';
import { CLASSES, ENTITIES, MISC, PREDICATES, RESOURCES } from '@/constants/graphSettings';
import { createClass, getClassById } from '@/services/backend/classes';
import { createList, getList } from '@/services/backend/lists';
import { createLiteral as createLiteralApi, getLiteral, updateLiteral as updateLiteralApi } from '@/services/backend/literals';
import { createPredicate, getPredicate } from '@/services/backend/predicates';
import { createResource as createResourceApi, getResource, updateResource as updateResourceApi } from '@/services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementById,
    deleteStatementsByIds,
    getStatements,
    getStatementsBundleBySubject,
    getTemplatesByClass,
    updateStatement,
} from '@/services/backend/statements';
import { getTemplate } from '@/services/backend/templates';
import { filterObjectOfStatementsByPredicateAndClass, guid } from '@/utils';

const initialState = {
    contributions: {},
    statements: {},
    resources: {},
    literals: {},
    properties: {},
    papers: {},
    templates: {},
    classes: {},
    isLoading: false,
    hasFailed: false,
    previousInputDataType: MISC.DEFAULT_LITERAL_DATATYPE,
    isHelpModalOpen: false,
    helpCenterArticleId: null,
    isTemplatesModalOpen: false,
    currentSementifyCell: [], // propertyid, contributionid,
};

export const contributionEditorSlice = createSlice({
    name: 'contributionEditor',
    initialState,
    reducers: {
        setCurrentSementifyCell: (state, { payload }) => {
            state.currentSementifyCell = payload;
        },
        setIsHelpModalOpen: (state, { payload: { isOpen, articleId } }) => {
            state.isHelpModalOpen = isOpen;
            state.helpCenterArticleId = articleId;
        },
        setIsTemplateModalOpen: (state, { payload: { isOpen } }) => {
            state.isTemplatesModalOpen = isOpen;
        },
        contributionsAdded: (state, { payload: { contributions, statements, resources, literals, papers, properties } }) => ({
            ...state,
            contributions: {
                ...state.contributions,
                ...contributions,
            },
            statements: {
                ...state.statements,
                ...statements,
            },
            resources: {
                ...state.resources,
                ...resources,
            },
            literals: {
                ...state.literals,
                ...literals,
            },
            papers: {
                ...state.papers,
                ...papers,
            },
            properties: {
                ...state.properties,
                ...properties,
            },
        }),
        setIsLoading: (state, { payload }) => {
            state.isLoading = payload;
        },
        setHasFailed: (state, { payload }) => {
            state.hasFailed = payload;
        },
        setIsLoadingTemplate: (state, { payload: { templateID, status } }) => {
            state.templates[templateID] = { isLoading: status };
        },
        setIsLoadingTemplateClass: (state, { payload: { classID, status, templateIds = [] /* in case there is no template for this class */ } }) => {
            state.classes[classID] = { isFetching: status, templateIds };
        },
        contributionsRemoved: (state, { payload }) => {
            for (const contributionId of payload) {
                delete state.contributions[contributionId];
            }
        },
        resourceAdded: (state, { payload: { statementId, contributionId, propertyId, resource } }) => {
            state.statements[statementId] = {
                type: ENTITIES.RESOURCE,
                contributionId,
                propertyId,
                objectId: resource.id,
            };
            state.resources[resource.id] = resource;
        },
        resourceUpdated: (state, { payload: { id, resource } }) => {
            state.statements[id].objectId = resource.id;
            state.resources[resource.id] = resource;
        },
        resourceStatementsUpdated: (state, { payload: { id, resource } }) => {
            state.resources[id] = resource;
        },
        resourceLabelUpdated: (state, { payload: { id, label } }) => {
            state.resources[id].label = label;
        },
        contributionUpdated: (state, { payload }) => {
            state.contributions[payload.id] = { ...state.contributions[payload.id], ...payload };
        },
        literalAdded: (state, { payload: { statementId, contributionId, propertyId, literal } }) => {
            state.statements[statementId] = {
                type: ENTITIES.LITERAL,
                contributionId,
                propertyId,
                objectId: literal.id,
            };
            state.literals[literal.id] = literal;
        },
        literalUpdated: (state, { payload: { id, label, datatype } }) => {
            state.literals[id].label = label;
            state.literals[id].datatype = datatype;
        },
        statementDeleted: (state, { payload }) => {
            delete state.statements[payload];
        },
        propertyAdded: (state, { payload }) => {
            state.properties[payload.id] = {
                ...payload,
                staticRowId: guid(),
            };
        },
        templateAdded: (state, { payload }) => {
            state.templates[payload.id] = { ...payload, isLoading: false };
            if (payload.target_class.id) {
                state.classes[payload.target_class.id] = {
                    ...(state.classes[payload.target_class.id] ?? {}),
                    templateIds: [...(state.classes[payload.target_class.id]?.templateIds ?? []), payload.id],
                };
            }
        },
        propertyDeleted: (state, { payload: { id, statementIds } }) => {
            delete state.properties[id];
            for (const statementId of statementIds) {
                delete state.statements[statementId];
            }
        },
        propertyUpdated: (state, { payload: { id, newProperty, statementIds } }) => {
            state.properties[newProperty.id] = { ...newProperty, staticRowId: state.properties[id].staticRowId };
            delete state.properties[id];
            for (const statementId of statementIds) {
                state.statements[statementId].propertyId = newProperty.id;
            }
        },
        paperUpdated: (state, { payload: { id, title, researchField = null } }) => {
            state.papers[id].label = title;
            if (researchField) {
                state.papers[id].researchField = researchField;
            }
        },
        updateContributionClasses: (state, { payload: { resourceId, classes } }) => {
            state.contributions[resourceId].classes = classes;
        },
        setPreviousInputDataType: (state, { payload }) => {
            state.previousInputDataType = payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LOCATION_CHANGE, () => initialState);
    },
});

export const {
    setCurrentSementifyCell,
    setIsHelpModalOpen,
    setIsTemplateModalOpen,
    contributionsAdded,
    setIsLoading,
    setHasFailed,
    setIsLoadingTemplate,
    setIsLoadingTemplateClass,
    contributionsRemoved,
    resourceUpdated,
    resourceStatementsUpdated,
    resourceLabelUpdated,
    contributionUpdated,
    literalUpdated,
    statementDeleted,
    resourceAdded,
    literalAdded,
    propertyAdded,
    templateAdded,
    propertyDeleted,
    propertyUpdated,
    paperUpdated,
    setPreviousInputDataType,
} = contributionEditorSlice.actions;

export default contributionEditorSlice.reducer;

// TODO: move to other file
const getOrCreateResource = async ({ action, id, label, classes = [] }) => {
    let resource;
    if (action === 'create-option') {
        resource = await getResource(await createResourceApi({ label, classes }));
    } else if (action === 'select-option') {
        resource = await getResource(id);
    }

    return resource;
};

const getOrCreateProperty = async ({ action, id, label }) => {
    let property;
    if (action === 'create-option') {
        const newPropertyId = await createPredicate(label);
        property = await getPredicate(newPropertyId);
    } else if (action === 'select-option') {
        property = await getPredicate(id);
    }

    return property;
};
// END TODO

export const loadContributions = (contributionIds) => async (dispatch) => {
    const resources = {};
    const literals = {};
    const statements = {};
    const contributions = {};
    const properties = {};
    const papers = {};
    const objects_classes = [];

    dispatch(setIsLoading(true));
    dispatch(setHasFailed(false));

    for (const contributionId of contributionIds) {
        // we are using getStatementsBundleBySubject to support formatted labels
        const contributionStatements = (await getStatementsBundleBySubject({ id: contributionId, maxLevel: 2, blacklist: [] })).statements;
        const paperStatements = await getStatements({ objectId: contributionId, predicateId: PREDICATES.HAS_CONTRIBUTION });
        const paper = paperStatements.find((statement) => statement.subject.classes.includes(CLASSES.PAPER))?.subject;
        const paperRF = await getStatements({ subjectId: paper?.id, predicateId: PREDICATES.HAS_RESEARCH_FIELD });
        const researchField = filterObjectOfStatementsByPredicateAndClass(paperRF, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD);
        const contribution = paperStatements.find((statement) => statement.object.classes.includes(CLASSES.CONTRIBUTION))?.object;

        // show error if: corresponding paper not found, or provided ID is not a contribution ID
        if (!paper?.id || !contribution?.classes.includes(CLASSES.CONTRIBUTION)) {
            dispatch(setIsLoading(false));
            dispatch(setHasFailed(true));
            return;
        }

        contributions[contributionId] = { ...contribution, paperId: paper.id };
        papers[paper.id] = { ...paper, researchField };

        for (const { id, predicate: property, object, Added_by } of contributionStatements.filter((s) => s.subject.id === contributionId)) {
            statements[id] = {
                contributionId,
                Added_by,
                propertyId: property.id,
                objectId: object.id,
                type: object._class,
            };
            properties[property.id] = {
                ...property,
                staticRowId: guid(),
            };
            if (object._class === ENTITIES.RESOURCE) {
                resources[object.id] = { ...object, statements: contributionStatements.filter((s) => s.subject.id === object.id) };
                objects_classes.push(
                    contributionStatements.filter((s) => s.subject.id === object.id && s.subject?.classes?.length).map((s) => s.subject.classes),
                );
            }
            if (object._class === ENTITIES.LITERAL) {
                literals[object.id] = object;
            }
        }
    }
    // Collect the list of classes
    const allClasses = uniq(flatten([...Object.keys(contributions).map((c) => contributions[c].classes), ...objects_classes]));
    // 3 - load templates
    const templatesOfClassesLoading = allClasses && allClasses?.map((classID) => dispatch(fetchTemplatesOfClassIfNeeded(classID)));

    await dispatch(
        contributionsAdded({
            contributions,
            statements,
            resources,
            literals,
            properties,
            papers,
        }),
    );
    /*
    // create properties
    await Promise.all(templatesOfClassesLoading).then(() => {
        Object.keys(contributions).map((c) => dispatch(createRequiredPropertiesInContribution(contributions[c].id)));
    });
    */
    dispatch(setIsLoading(false));
};

export const updateLiteral = (payload) => async (dispatch) => {
    const { id, label, datatype } = payload;
    dispatch(setIsLoading(true));
    updateLiteralApi(id, label, datatype)
        .then(() => {
            dispatch(literalUpdated(payload));
            toast.success('Literal label updated successfully');
            dispatch(setIsLoading(false));
        })
        .catch(() => {
            toast.error('Something went wrong while updating the literal.');
            dispatch(setIsLoading(false));
        });
};

export const updateResourceLabel = (payload) => async (dispatch) => {
    const { id, label } = payload;
    dispatch(setIsLoading(true));
    updateResourceApi(id, { label })
        .then(() => {
            dispatch(resourceLabelUpdated(payload));
            toast.success('Resource label updated successfully');
            dispatch(setIsLoading(false));
        })
        .catch(() => {
            toast.error('Something went wrong while updating the resource label.');
            dispatch(setIsLoading(false));
        });
};

export const deleteStatement = (id) => (dispatch) => {
    deleteStatementById(id)
        .then(() => {
            dispatch(statementDeleted(id));
        })
        .catch(() => toast.error('Error deleting statement, please refresh the page'));
};

/**
 * Create statements for a resource starting from an array of statements
 *
 * @param {Array} data array of statement
 * @return {Object} object of statements to use as an entry for fillStatements action
 */
const generateStatementsFromExternalData = (data) => {
    const statements = [];
    for (const statement of data) {
        statements.push({
            propertyId: statement.predicate.id,
            value: statement.value,
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
export const addValue = (entityType, value, valueClass, contributionId, propertyId) => async (dispatch) => {
    let newEntity = { _class: entityType, id: value.id, label: value.label, shared: value.shared, classes: value.classes, datatype: value.datatype };

    let apiCall;
    if (!value.selected || value.external) {
        switch (entityType) {
            case ENTITIES.RESOURCE:
                if (newEntity.datatype === 'list') {
                    apiCall = getList(await createList({ label: value.label }));
                } else {
                    apiCall = getResource(await createResourceApi({ label: value.label, classes: valueClass ? [valueClass.id] : [] }));
                }
                break;
            case ENTITIES.PREDICATE:
                apiCall = getPredicate(await createPredicate(value.label));
                break;
            case ENTITIES.LITERAL:
                apiCall = getLiteral(await createLiteralApi(value.label, value.datatype));
                break;
            case ENTITIES.CLASS:
                apiCall = getClassById(await createClass(value.label));
                break;
            case 'empty':
                apiCall = getResource(RESOURCES.EMPTY_RESOURCE);
                break;
            default:
                apiCall = getLiteral(await createLiteralApi(value.label, value.datatype));
        }
    } else {
        apiCall = Promise.resolve(newEntity);
    }

    await apiCall
        .then((response) => {
            newEntity = response;
            if (newEntity._class === 'list') {
                newEntity._class = entityType;
            }
            return createResourceStatement(contributionId, propertyId, newEntity.id);
        })
        .then((newStatementId) => {
            switch (entityType) {
                case ENTITIES.RESOURCE:
                    dispatch(
                        resourceAdded({
                            statementId: newStatementId,
                            contributionId,
                            propertyId,
                            resource: newEntity,
                        }),
                    );
                    break;
                case ENTITIES.PREDICATE:
                    console.log('Not implemented yet');
                    break;
                case ENTITIES.LITERAL:
                    dispatch(
                        literalAdded({
                            statementId: newStatementId,
                            contributionId,
                            propertyId,
                            literal: newEntity,
                        }),
                    );
                    break;
                default:
                    dispatch(
                        literalAdded({
                            statementId: newStatementId,
                            contributionId,
                            propertyId,
                            literal: newEntity,
                        }),
                    );
            }
            dispatch(setIsLoading(false));
        })
        .catch((e) => {
            console.error(e);
            toast.error('Something went wrong while creating the resource.');
            dispatch(setIsLoading(false));
        });

    // create statements
    value.statements &&
        dispatch(
            fillStatements({
                statements: generateStatementsFromExternalData(value.statements),
                resourceId: newEntity.id,
            }),
        );
    return newEntity.id;
};

export const createResource =
    ({ contributionId, propertyId, action, classes = [], resourceId = null, resourceLabel = null }) =>
    async (dispatch) => {
        dispatch(setIsLoading(true));

        const resource = await getOrCreateResource({
            action,
            id: resourceId,
            label: resourceLabel,
            classes,
        });

        if (!resource) {
            return;
        }

        // create the new statement
        return createResourceStatement(contributionId, propertyId, resource.id)
            .then((newStatement) => {
                dispatch(
                    resourceAdded({
                        statementId: newStatement.id,
                        contributionId,
                        propertyId,
                        resource,
                    }),
                );
                dispatch(setIsLoading(false));
                return resource.id;
            })
            .catch(() => {
                toast.error('Something went wrong while creating the resource.');
                dispatch(setIsLoading(false));
            });
    };

export const createLiteral =
    ({ contributionId, propertyId, label, datatype }) =>
    async (dispatch) => {
        dispatch(setIsLoading(true));

        // fetch the selected resource id
        const literal = await getLiteral(await createLiteralApi(label, datatype));

        if (!literal) {
            return;
        }

        // create the new statement
        createLiteralStatement(contributionId, propertyId, literal.id)
            .then((newStatementId) => {
                dispatch(
                    literalAdded({
                        statementId: newStatementId,
                        contributionId,
                        propertyId,
                        literal,
                    }),
                );
                dispatch(setIsLoading(false));
            })
            .catch(() => {
                toast.error('Something went wrong while creating the literal.');
                dispatch(setIsLoading(false));
            });
    };

export const createProperty =
    ({ action, id = null, label = null }) =>
    async (dispatch) => {
        const property = await getOrCreateProperty({ action, id, label });
        if (!property) {
            return;
        }
        dispatch(propertyAdded(property));
    };

export const deleteProperty =
    ({ id, statementIds }) =>
    (dispatch) => {
        (statementIds?.length > 0 ? deleteStatementsByIds(statementIds) : Promise.resolve())
            .then(() => {
                dispatch(
                    propertyDeleted({
                        id,
                        statementIds,
                    }),
                );
            })
            .catch(() => {
                toast.error('Error deleting statements, please refresh the page');
            });
    };

export const updateProperty =
    ({ id, statementIds, action, newId = null, newLabel = null }) =>
    async (dispatch) => {
        dispatch(setIsLoading(true));
        const property = await getOrCreateProperty({ action, id: newId, label: newLabel });
        if (!property) {
            dispatch(setIsLoading(false));
            return;
        }

        try {
            for (const statementId of statementIds) {
                await updateStatement(statementId, { predicate_id: property.id });
            }
            dispatch(
                propertyUpdated({
                    id,
                    newProperty: property,
                    statementIds,
                }),
            );
        } catch (e) {
            toast.error('Error updating statements, please refresh the page');
        }
        dispatch(setIsLoading(false));
        // use this code instead when the backend issue is fixed: https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/308
        /* updateStatements(statementIds, { predicate_id: property.id })
        .then(() => {
            dispatch(
                propertyUpdated({
                    id,
                    newProperty: property,
                    statementIds
                })
            );
        })
        .catch(e => toast.error(`Error updating statements, please refresh the page`)); */
    };

/**
 * Fetch template by ID
 *
 * @param {String} templateID - Template ID
 * @return {Promise} Promise object represents the template
 */
export function fetchTemplateIfNeeded(templateID) {
    return async (dispatch, getState) => {
        if (shouldFetchTemplate(getState(), templateID)) {
            dispatch(setIsLoadingTemplate({ templateID, status: true }));
            const template = await getTemplate(templateID);
            // Add template to the global state
            dispatch(templateAdded(template)); // TODO comment when loading takes too long
            return template;
        }
        // Let the calling code know there's nothing to wait for.
        const template = getState().contributionEditor.templates[templateID];
        return Promise.resolve(template);
    };
}

/**
 * Check if the template should be fetched
 *
 * @param {Object} state - Current state of the Store
 * @param {String} templateID - Template ID
 * @return {Boolean} if the template should be fetched or not
 */
function shouldFetchTemplate(state, templateID) {
    const template = state.contributionEditor.templates[templateID];
    if (!template) {
        return true;
    }
    return false;
}

/**
 * Check if the class template should be fetched
 *
 * @param {Object} state - Current state of the Store
 * @param {String} classID - Class ID
 * @return {Boolean} if the class template should be fetched or not
 */
function shouldFetchTemplatesOfClass(state, classID) {
    const classObj = state.contributionEditor.classes[classID];
    if (!classObj) {
        return true;
    }
    return false;
}

/**
 * Fetch templates of class
 *
 * @param {String} classID - Class ID
 */
export function fetchTemplatesOfClassIfNeeded(classID) {
    return async (dispatch, getState) => {
        if (shouldFetchTemplatesOfClass(getState(), classID)) {
            dispatch(setIsLoadingTemplateClass({ classID, status: true }));
            const templateIds = await getTemplatesByClass(classID);
            dispatch(setIsLoadingTemplateClass({ classID, status: false }));
            const templates = await Promise.all(templateIds.map((templateId) => dispatch(fetchTemplateIfNeeded(templateId)))).catch((e) => []);
            return templates;
        }
        // Let the calling code know there's nothing to wait for.
        return Promise.resolve();
    };
}

/**
 * Get template IDs by contribution ID
 *
 * @param {Object} state Current state of the Store
 * @param {String} contributionId Contribution ID
 * @return {String[]} list of template IDs
 */
export function getTemplateIDsByContributionID(state, contributionId) {
    if (!contributionId) {
        return [];
    }

    const contribution = state.contributionEditor.contributions[contributionId];
    if (!contribution) {
        return [];
    }
    let templateIds = [];
    if (contribution.classes) {
        for (const c of contribution.classes) {
            if (state.contributionEditor.classes[c]) {
                templateIds = templateIds.concat(state.contributionEditor.classes[c].templateIds);
            }
        }
    }
    templateIds = uniq(templateIds);

    return templateIds;
}

/**
 * Get propertyShapes by contribution ID
 *
 * @param {Object} state Current state of the Store
 * @param {String} contributionId Resource ID
 * @return {{
 * id: String,
 * min_count: Number,
 * max_count: Number,
 * property: Object,
 * value: Object=,
 * minInclusive:Number,
 * maxInclusive:Number ,
 * pattern:String
 * }[]} list of propertyShapes
 */
export function getPropertyShapesByContributionID(state, contributionId, classId = null) {
    if (!contributionId) {
        return [];
    }
    const contribution = state.contributionEditor.contributions[contributionId];
    if (!contribution) {
        return [];
    }

    // 1 - Get all template ids of this resource
    const templateIds = getTemplateIDsByContributionID(state, contributionId);

    // 2 - Collect the propertyShapes
    let propertyShapes = [];
    for (const templateId of templateIds) {
        const template = state.contributionEditor.templates[templateId];
        if (template && template.properties && (!classId || classId === template.target_class?.id)) {
            propertyShapes = propertyShapes.concat(template.properties);
        }
    }
    return propertyShapes;
}

/**
 * Create required properties based on the used template
 *
 * @param {String} contributionId Contribution ID
 * @return {{existingPredicateId: String, propertyId: String}[]} list of created properties
 */
export function createRequiredPropertiesInContribution(contributionId) {
    return (dispatch, getState) => {
        const propertyShapes = getPropertyShapesByContributionID(getState(), contributionId);
        // Get the list of existing predicate ids
        const existingPropertyIds = Object.keys(getState().contributionEditor.properties);

        // Add required properties (min_count >= 1)
        propertyShapes
            .filter((x) => !existingPropertyIds.includes(x.path.id))
            .map((mp) => {
                if (mp.min_count >= 1) {
                    dispatch(propertyAdded(mp.path));
                }
                return null;
            });

        return Promise.resolve();
    };
}

/**
 * Update contribution classes
 *
 * @param {Object} data - contribution Object
 * @param {String=} data.contributionId - contribution ID
 * @param {Array=} data.classes - Classes of value
 */
export const updateContributionClasses =
    ({ contributionId, classes }) =>
    (dispatch, getState) => {
        const resource = getState().contributionEditor.contributions[contributionId];
        if (resource) {
            dispatch(
                contributionUpdated({
                    ...resource,
                    classes: uniq(classes?.filter((c) => c) ?? []),
                }),
            );

            // Fetch templates
            const templatesOfClassesLoading = classes && classes?.filter((c) => c).map((classID) => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
            // Add required properties
            Promise.all(templatesOfClassesLoading).then(() => dispatch(createRequiredPropertiesInContribution(contributionId)));

            return updateResourceApi(contributionId, { classes: uniq(classes?.filter((c) => c) ?? []) });
        }
        return Promise.resolve();
    };

/**
 * Fill a contributions with a template
 *
 * @param {String} templateID - Template ID
 * @return {Promise} Promise object
 */

export function fillContributionsWithTemplate({ templateID }) {
    return async (dispatch, getState) =>
        dispatch(fetchTemplateIfNeeded(templateID)).then(async (templateDate) => {
            const contributionsIds = Object.keys(getState().contributionEditor.contributions);
            const template = templateDate;
            // Check if it's a template
            if (template && template?.properties?.length > 0) {
                // TODO : handle the case where the template isFetching
                if (!template.relations.predicate || template?.relations.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                    // update the class of the current resource
                    contributionsIds.map((contributionId) =>
                        dispatch(
                            updateContributionClasses({
                                contributionId,
                                classes: [...getState().contributionEditor.contributions[contributionId].classes, template.target_class.id],
                            }),
                        ),
                    );
                    // Add properties
                    for (const propertyShape of template?.properties.filter((mp) => mp.min_count >= 1)) {
                        dispatch(propertyAdded(propertyShape.path));
                    }
                } else if (template.relations.predicate) {
                    // Add template to the contribution
                    dispatch(propertyAdded(template.relations.predicate));
                    contributionsIds.map(async (contributionId) => {
                        const instanceResourceId = await createResourceApi({
                            label: template.label,
                            classes: template.target_class ? [template.target_class.id] : [],
                        });
                        await dispatch(
                            createResource({
                                contributionId,
                                propertyId: template.relations.predicate.id,
                                action: 'select-option',
                                resourceId: instanceResourceId,
                            }),
                        );
                    });
                }
            }
        });
}

/**
 * Get propertyShapes by resource ID and PredicateID
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @param {String} predicateId Existing Predicate ID
 * @return {{
 * id: String,
 * min_count: Number,
 * max_count: Number,
 * property: Object,
 * value: Object=,
 * minInclusive:Number,
 * maxInclusive:Number ,
 * pattern:String
 * }[]} list of propertyShapes
 */
export function getPropertyShapesByResourceIDAndPredicateID(state, resourceId, predicateId) {
    const resourcePropertyShapes = getPropertyShapesByContributionID(state, resourceId);
    if (resourcePropertyShapes.length === 0) {
        return [];
    }
    return resourcePropertyShapes.filter((c) => c.path.id === predicateId);
}

/**
 * Get suggested properties
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {Object[]} list of suggested propertyShapes
 */
export function getSuggestedProperties(state) {
    const existingPropertyIds = Object.keys(state.contributionEditor.properties);
    const comp = Object.keys(state.contributionEditor.contributions).map((contributionId) => {
        const propertyShapes = getPropertyShapesByContributionID(state, contributionId);
        return propertyShapes.filter((x) => !existingPropertyIds.includes(x.path.id));
    });
    return uniqBy(flatten(comp), 'path.id');
}

/**
 * Get research problems
 *
 * @param {Object} state Current state of the Store
 * @return {Object[]} list of research problems
 */
export function getResearchProblems(state) {
    const problems = Object.keys(state.contributionEditor.contributions).map((cId) =>
        Object.values(state.contributionEditor.statements)
            .filter((s) => s.contributionId === cId && s.propertyId === PREDICATES.HAS_RESEARCH_PROBLEM)
            .map((s) => s.objectId),
    );
    return uniq(flatten(problems));
}

/**
 * Get research fields
 *
 * @param {Object} state Current state of the Store
 * @return {Object[]} list of research fields
 */
export function getResearchFields(state) {
    const fields = Object.values(state.contributionEditor.papers)
        .filter((p) => p.researchField)
        .map((p) => p.researchField.id);
    return uniq(flatten(fields));
}

/**
 * Get common classes among contributions
 *
 * @param {Object} state Current state of the Store
 * @return {Object[]} list of classes Ids
 */
export function getCommonClasses(state) {
    const classes = Object.values(state.contributionEditor.contributions).map((p) => p.classes);
    return uniq(intersection(...classes));
}

/**
 * Remove properties with no values of contributions based on the template of a class
 * (This should be called before removing the classes from the contributions)
 * @param {String} resourceId Resource ID
 * @param {String} classId Class ID
 */
export function removeEmptyPropertiesOfClass({ classId }) {
    return (dispatch, getState) => {
        const propertyShapes = flatten(
            Object.keys(getState().contributionEditor.contributions).map((contributionId) =>
                getPropertyShapesByContributionID(getState(), contributionId, classId),
            ),
        );
        const existingPropertyIdsToRemove = propertyShapes.map((mp) => mp.path?.id).filter((p) => p);

        return existingPropertyIdsToRemove.map((propertyId) => {
            // count statements and delete if number of statements == 0
            const countStatements = Object.keys(getState().contributionEditor.contributions).filter(
                (contributionId) =>
                    Object.values(getState().contributionEditor.statements).filter(
                        (s) => s.propertyId === propertyId && s.contributionId === contributionId,
                    ).length,
            );
            if (countStatements?.length === 0) {
                dispatch(
                    propertyDeleted({
                        id: propertyId,
                        statementIds: [],
                    }),
                );
            }
            return [];
        });
    };
}

/**
 * Remove class from the contributions
 * @param {String} classId Class ID
 */
export function removeClassFromContributionResource({ classId }) {
    return (dispatch, getState) => {
        const contributionsIds = Object.keys(getState().contributionEditor.contributions);
        return Promise.all(
            contributionsIds.map((contributionId) =>
                dispatch(
                    updateContributionClasses({
                        contributionId,
                        classes: [...(getState().contributionEditor.contributions[contributionId].classes?.filter((c) => c !== classId) ?? [])],
                    }),
                ),
            ),
        );
    };
}

/**
 * Can add value to a property in a contribution
 * (compare the number of values with max_count)
 * @param {Object} state Current state of the Store
 * @param {String} contributionId Resource ID
 * @param {String} propertyId Property ID
 * @return {Boolean} Whether it's possible to add a value
 */
export function canAddValueAction(state, contributionId, propertyId) {
    const typePropertyShapes = getPropertyShapesByResourceIDAndPredicateID(state, contributionId, propertyId);
    if (typePropertyShapes?.length > 0) {
        const countStatements = Object.values(state.contributionEditor.statements).filter(
            (s) => s.propertyId === propertyId && s.contributionId === contributionId,
        ).length;
        if (typePropertyShapes[0].max_count && countStatements >= parseInt(typePropertyShapes[0].max_count)) {
            return false;
        }
        return true;
    }
    return true;
}

/**
 * Can delete property
 * (check all templates do not have min_count>=1 for the property)
 * @param {Object} state Current state of the Store
 * @param {String} propertyId Property ID
 * @return {Boolean} Whether it's possible to delete the property
 */
export function canDeletePropertyAction(state, propertyId) {
    const contributionsIds = Object.keys(state.contributionEditor.contributions);
    return (
        contributionsIds
            .map((contributionId) => {
                const typePropertyShapes = getPropertyShapesByResourceIDAndPredicateID(state, contributionId, propertyId);
                if (typePropertyShapes?.length > 0) {
                    if (typePropertyShapes[0].min_count >= 1) {
                        return false;
                    }
                    return true;
                }
                return true;
            })
            ?.every((can) => can === true) ?? true
    );
}

/**
 * Fill the statements of a resource
 * @param {Object} statements - Statements of shape {propertyId, value: {id, label, datatype}}
 * @param {string} resourceId - The target resource ID
 */
export const fillStatements =
    ({ statements, resourceId }) =>
    async () => {
        for (const statement of statements) {
            const newObjectId = await createLiteralApi(statement.value.label, statement.value.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE);
            await createResourceStatement(resourceId, statement.propertyId, newObjectId);
        }
        return Promise.resolve();
    };

/**
 * Get formatted label of resource
 * @param {String} resource Resource object
 * @param {String} labelFormat Current state of the Store
 * @return {String} Formatted label
 */
export function generatedFormattedLabel(resource, labelFormat) {
    const valueObject = {};
    const properties = uniqBy(resource.statements?.map((s) => s.predicate.id));
    for (const propertyId of properties) {
        valueObject[propertyId] = resource?.statements?.find((s) => propertyId === s.predicate.id)?.object.label;
    }
    if (Object.keys(valueObject).length > 0) {
        return format(labelFormat, valueObject);
    }
    return resource.label;
}

/**
 * Update resource statements
 * @param {String} resourceId Resource id to update
 * @return {String} Formatted label
 */
export function updateResourceStatementsAction(resourceId) {
    return async (dispatch) => {
        const resource = await getResource(resourceId);
        return getStatements({ subjectId: resourceId }).then(async (statements) => {
            dispatch(
                resourceStatementsUpdated({
                    id: resourceId,
                    resource: { ...resource, statements },
                }),
            );
            // load templates
            resource?.classes?.map((classID) => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
        });
    };
}

/**
 * Check if the input filed is Literal
 *  (if one of the default data type: Date, String, Number)
 * @param {Object[]} propertyShapes Array of propertyShapes
 * @return {Boolean} if this input field is Literal
 */
export const isLiteral = (propertyShapes) => {
    let _isLiteral = false;
    for (const typeId of propertyShapes.map((tc) => tc.datatype?.id)) {
        if (
            DATA_TYPES.filter((dt) => dt._class === ENTITIES.LITERAL)
                .map((t) => t.classId)
                .includes(typeId)
        ) {
            _isLiteral = true;
            break;
        }
    }
    return _isLiteral;
};

/**
 * Get the type of value
 * @param {Object[]} propertyShapes Array of propertyShapes
 * @return {Object=} the class of value or null
 */
export const getValueClass = (propertyShapes) =>
    propertyShapes &&
    propertyShapes.length > 0 &&
    ((propertyShapes[0].class && propertyShapes[0].class.id) || (propertyShapes[0].datatype && propertyShapes[0].datatype.id))
        ? propertyShapes[0].class || propertyShapes[0].datatype
        : null;
