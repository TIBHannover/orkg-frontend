import * as type from './types.js';
import { guid, filterStatementsBySubjectId } from 'utils';
import { orderBy, uniq } from 'lodash';
import { PREDICATES, CLASSES, ENTITIES } from 'constants/graphSettings';
import { getEntity } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import {} from 'services/backend/statements';
import { flatten, uniqBy } from 'lodash';
import format from 'string-format';
import {
    getTemplateById,
    getTemplatesByClass,
    getStatementsBundleBySubject,
    createResourceStatement,
    createLiteralStatement
} from 'services/backend/statements';
import { createResource as createResourceApi, updateResourceClasses as updateResourceClassesApi } from 'services/backend/resources';
import DATA_TYPES from 'constants/DataTypes.js';
import { toast } from 'react-toastify';

export const updateSettings = data => dispatch => {
    dispatch({
        type: type.STATEMENT_BROWSER_UPDATE_SETTINGS,
        payload: data
    });
};

export const setIsHelpModalOpen = data => dispatch => {
    dispatch({
        type: type.SET_IS_HELP_MODAL_OPEN,
        payload: {
            articleId: data.articleId,
            isOpen: data.isOpen
        }
    });
};

export const setIsPreferencesOpen = data => dispatch => {
    dispatch({
        type: type.SET_IS_PREFERENCES_OPEN,
        payload: data
    });
};

export const updatePreferences = data => dispatch => {
    dispatch({
        type: type.UPDATE_PREFERENCES,
        payload: data
    });
};

export const setInitialPath = data => dispatch => {
    data?.length > 0 &&
        dispatch({
            type: type.SET_RESOURCE_HISTORY,
            payload: data
        });
};

export const setIsTemplateModalOpen = data => dispatch => {
    dispatch({
        type: type.SET_IS_TEMPLATES_MODAL_OPEN,
        payload: {
            isOpen: data.isOpen
        }
    });
};

/**
 * Initialize the statement browser without contribution
 * (e.g : new store to show resource in dialog)
 * @param {Object} data - Initial resource
 * @param {string} data.label - The label of the resource.
 * @param {string} data.resourceId - The resource id.
 */
export const initializeWithoutContribution = data => dispatch => {
    // To initialize:
    // 1. Create a resource (the one that is requested), so properties can be connected to this
    // 2. Select this resource (only a selected resource is shown)
    // 3. Fetch the statements related to this resource

    const label = data.label;
    const resourceId = data.resourceId;
    const rootNodeType = data.rootNodeType;
    let classes = [];
    if (rootNodeType === ENTITIES.PREDICATE) {
        classes = [CLASSES.PREDICATE];
    }
    if (rootNodeType === ENTITIES.CLASS) {
        classes = [CLASSES.CLASS];
    }

    dispatch(
        createResource({
            label: label,
            existingResourceId: resourceId,
            resourceId: resourceId,
            classes: classes,
            _class: data.rootNodeType
        })
    );

    dispatch(
        selectResource({
            increaseLevel: false,
            resourceId: resourceId,
            label: label
        })
    );

    dispatch(
        fetchStatementsForResource({
            existingResourceId: resourceId,
            resourceId: resourceId,
            rootNodeType: rootNodeType,
            depth: 3
        })
    );
};

/**
 * Initialize the statement browser with a resource then add the required properties
 *
 * @param {Object} data - Initial resource
 * @param {string} data.label - The label of the resource.
 * @param {string} data.resourceId - The resource id.
 * @return {Promise} Promise object of creating the required properties
 */
export function initializeWithResource(data) {
    return dispatch => {
        const label = data.label;
        const resourceId = data.resourceId;

        dispatch({
            type: type.CLEAR_RESOURCE_HISTORY
        });

        dispatch(
            selectResource({
                increaseLevel: false,
                resourceId: resourceId,
                label: label
            })
        ).then(() => dispatch(createRequiredPropertiesInResource(resourceId)));
    };
}

/**
 * Get new properties that are not saved in the backend yet
 *
 * @param {Object} state - Current state of the Store
 * @return {Promise} List of new properties
 */
export function getNewPropertiesList(state) {
    const newPropertiesList = [];
    for (const key in state.statementBrowser.properties.byId) {
        const property = state.statementBrowser.properties.byId[key];
        if (!property.existingPredicateId) {
            newPropertiesList.push({
                id: null,
                label: property.label
            });
        }
    }
    //  ensure no properties with duplicate Labels exist
    return uniqBy(newPropertiesList, 'label');
}

/**
 * Get the list of existing predicate ids of a resource
 *
 * @param {Object} state - Current state of the Store
 * @param {String} resourceId - Resource ID
 * @return {Array} - list of existing predicates
 */
export function getExistingPredicatesByResource(state, resourceId) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }
    let propertyIds = resource.propertyIds;
    if (propertyIds) {
        propertyIds = resource.propertyIds ? resource.propertyIds : [];
        propertyIds = propertyIds.map(propertyId => {
            const property = state.statementBrowser.properties.byId[propertyId];
            return property.existingPredicateId;
        });
        return propertyIds.filter(p => p); // return a list without null values (predicates that aren't in the database)
    } else {
        return [];
    }
}

/**
 * Fill the statements of a resource
 * (e.g : new store to show resource in dialog)
 * @param {Object} statements - Statement
 * @param {Array} statements.properties - The properties
 * @param {Array} statements.values - The values
 * @param {string} resourceId - The target resource ID
 * @param {boolean} syncBackend - Sync the fill with the backend
 */
export const fillStatements = ({ statements, resourceId, syncBackend = false }) => async (dispatch, getState) => {
    // properties
    for (const property of statements.properties) {
        dispatch(
            createProperty({
                propertyId: property.propertyId ? property.propertyId : guid(),
                existingPredicateId: property.existingPredicateId,
                resourceId: resourceId,
                label: property.label,
                isAnimated: property.isAnimated !== undefined ? property.isAnimated : false,
                canDuplicate: property.canDuplicate ? true : false
            })
        );
    }

    // values
    for (const value of statements.values) {
        /**
         * The resource ID of the value
         * @type {string}
         */
        let newObject = null;
        /**
         * The statement of the value
         * @type {string}
         */
        let newStatement = null;
        /**
         * The value ID in the statement browser
         * @type {string}
         */
        const valueId = guid();

        if (syncBackend) {
            const predicate = getState().statementBrowser.properties.byId[value.propertyId];
            if (value.existingResourceId) {
                // The value exist in the database
                newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, value.existingResourceId);
            } else {
                // The value doesn't exist in the database
                switch (value._class) {
                    case ENTITIES.RESOURCE:
                        newObject = await createResourceApi(value.label, value.classes ? value.classes : []);
                        newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, newObject.id);
                        break;
                    case ENTITIES.PREDICATE:
                        newObject = await createPredicate(value.label);
                        newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, newObject.id);
                        break;
                    default:
                        newObject = await createLiteral(value.label, value.datatype);
                        newStatement = await createLiteralStatement(resourceId, predicate.existingPredicateId, newObject.id);
                }
            }
        }

        dispatch(
            createValue({
                valueId: value.valueId ? value.valueId : valueId,
                ...value,
                propertyId: value.propertyId,
                existingResourceId: syncBackend && newObject ? newObject.id : value.existingResourceId ? value.existingResourceId : null,
                isExistingValue: syncBackend ? true : value.isExistingValue ? value.isExistingValue : false,
                statementId: newStatement ? newStatement.id : null
            })
        );
    }

    return Promise.resolve();
};

/**
 * Get the list of property id of a resource by existing predicate id
 *
 * @param {Object} state - Current state of the Store
 * @param {String} resourceId - Resource ID
 * @param {String} existingPredicateId - existing predicate ID
 * @return {String} - property id
 */
export function getPropertyIdByByResourceAndPredicateId(state, resourceId, existingPredicateId) {
    if (!resourceId) {
        return null;
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return null;
    }

    const propertyIds = resource.propertyIds ?? [];
    let propertyId;
    if (propertyIds?.length > 0) {
        propertyId = propertyIds.find(propertyId => {
            const property = state.statementBrowser.properties.byId[propertyId];
            return property.existingPredicateId === existingPredicateId;
        });
        return propertyId ?? null; // return a list without null values (predicates that aren't in the database)
    } else {
        return null;
    }
}

/**
 * Remove properties with no values of resource based on the template of a class
 * (This should be called before removing the class from the source it self)
 * @param {String} resourceId Resource ID
 * @param {String} classId Class ID
 */
export function removeEmptyPropertiesOfClass({ resourceId, classId }) {
    return (dispatch, getState) => {
        const components = getComponentsByResourceID(getState(), resourceId, classId);
        const existingPropertyIdsToRemove = components.map(mp => mp.property?.id).filter(p => p);
        const resource = getState().statementBrowser.resources.byId[resourceId];
        if (!resource) {
            return [];
        }
        let propertyIds = resource.propertyIds;
        if (propertyIds) {
            propertyIds = resource.propertyIds ? resource.propertyIds : [];
            for (const propertyId of propertyIds) {
                const property = getState().statementBrowser.properties.byId[propertyId];
                if (existingPropertyIdsToRemove.includes(property.existingPredicateId) && property.valueIds?.length === 0) {
                    dispatch(
                        deleteProperty({
                            id: property.propertyId,
                            resourceId: resourceId
                        })
                    );
                }
            }
        } else {
            return [];
        }
    };
}

/**
 * Create required properties based on the used template
 *
 * @param {String} resourceId Resource ID
 * @return {{existingPredicateId: String, propertyId: String}[]} list of created properties
 */
export function createRequiredPropertiesInResource(resourceId) {
    return (dispatch, getState) => {
        const createdProperties = [];
        const components = getComponentsByResourceID(getState(), resourceId);
        const existingPropertyIds = getExistingPredicatesByResource(getState(), resourceId);

        // Add required properties (minOccurs >= 1)
        components
            .filter(x => !existingPropertyIds.includes(x.property.id))
            .map(mp => {
                if (mp.minOccurs >= 1) {
                    const propertyId = guid();
                    dispatch(
                        createProperty({
                            propertyId: propertyId,
                            resourceId: resourceId,
                            existingPredicateId: mp.property.id,
                            label: mp.property.label,
                            isExistingProperty: true,
                            isTemplate: false
                        })
                    );
                    createdProperties.push({
                        existingPredicateId: mp.property.id,
                        propertyId
                    });
                }
                return null;
            });

        return Promise.resolve(createdProperties);
    };
}

/**
 * Get research problems of contribution resource
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {String[]} list of template IDs
 */
export function getResearchProblemsOfContribution(state, resourceId) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }
    if (resource && resource.propertyIds) {
        const researchProblemProperty = resource.propertyIds.find(
            p => state.statementBrowser.properties.byId[p].existingPredicateId === PREDICATES.HAS_RESEARCH_PROBLEM
        );
        if (researchProblemProperty) {
            const resourcesId = state.statementBrowser.properties.byId[researchProblemProperty].valueIds
                .filter(v => state.statementBrowser.values.byId[v].isExistingValue)
                .map(v => state.statementBrowser.values.byId[v].resourceId);
            return uniq(resourcesId);
        }
    }
    return [];
}

/**
 * Get template IDs by resource ID
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {String[]} list of template IDs
 */
export function getTemplateIDsByResourceID(state, resourceId) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }
    let templateIds = [];
    if (resource.classes) {
        for (const c of resource.classes) {
            if (state.statementBrowser.classes[c]) {
                templateIds = templateIds.concat(state.statementBrowser.classes[c].templateIds);
            }
        }
    }
    templateIds = uniq(templateIds);
    return templateIds;
}

/**
 * Get components by resource ID
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {{
 * id: String,
 * minOccurs: Number,
 * maxOccurs: Number,
 * property: Object,
 * value: Object=,
 * validationRules: Array
 * }[]} list of components
 */
export function getComponentsByResourceID(state, resourceId, classId = null) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }

    // 1 - Get all template ids of this resource
    const templateIds = getTemplateIDsByResourceID(state, resourceId);

    // 2 - Collect the components
    let components = [];
    for (const templateId of templateIds) {
        const template = state.statementBrowser.templates[templateId];
        if (template && template.components && (!classId || classId === template.class?.id)) {
            components = components.concat(template.components);
        }
    }
    return components;
}

/**
 * Get components by resource ID and PredicateID
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @param {String} predicateId Existing Predicate ID
 * @return {{
 * id: String,
 * minOccurs: Number,
 * maxOccurs: Number,
 * property: Object,
 * value: Object=,
 * validationRules: Array
 * }[]} list of components
 */
export function getComponentsByResourceIDAndPredicateID(state, resourceId, predicateId) {
    const resourceComponents = getComponentsByResourceID(state, resourceId);
    if (resourceComponents.length === 0) {
        return [];
    }
    return resourceComponents.filter(c => c.property.id === predicateId);
}

export const resetStatementBrowser = () => dispatch => {
    dispatch({
        type: type.RESET_STATEMENT_BROWSER
    });
};

export const loadStatementBrowserData = data => dispatch => {
    dispatch({
        type: type.STATEMENT_BROWSER_LOAD_DATA,
        payload: data
    });
};

/**
 * Create Property
 *
 * @param {Object} data - Property Object
 * @param {String} data.resourceId - Resource ID
 * @param {String=} data.propertyId - Property ID
 * @param {String=} data.existingPredicateId - Existing PredicateId ID
 * @param {Boolean} data.canDuplicate - Whether it's possible to duplicate the existing predicate
 */
export function createProperty(data) {
    return (dispatch, getState) => {
        if (!data.canDuplicate && data.existingPredicateId) {
            const resource = getState().statementBrowser.resources.byId[data.resourceId];

            if (resource && resource.propertyIds) {
                const isExistingProperty = resource.propertyIds.find(p => {
                    if (getState().statementBrowser.properties.byId[p].existingPredicateId === data.existingPredicateId) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (isExistingProperty) {
                    // Property exists already
                    toast.info(`The property ${data.label} exists already!`);
                    return null;
                }
            }
        }
        dispatch({
            type: type.CREATE_PROPERTY,
            payload: {
                propertyId: data.propertyId ? data.propertyId : guid(),
                ...data
            }
        });
    };
}

/**
 * Can add property in resource
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {Boolean} Whether it's possible to add a property
 */
export function canAddProperty(state, resourceId) {
    // Get all template ids
    const templateIds = getTemplateIDsByResourceID(state, resourceId);

    // Check if one of the template is strict
    for (const templateId of templateIds) {
        const template = state.statementBrowser.templates[templateId];
        if (template && template.isStrict) {
            return false;
        }
    }
    return true;
}

/**
 * Can add value in property resource
 * (compare the number of values with maxOccurs)
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @param {String} propertyId Property ID
 * @return {Boolean} Whether it's possible to add a value
 */
export function canAddValue(state, resourceId, propertyId) {
    const property = state.statementBrowser.properties.byId[propertyId];
    if (property) {
        const typeComponents = getComponentsByResourceIDAndPredicateID(state, resourceId, property.existingPredicateId);
        if (typeComponents && typeComponents.length > 0) {
            if (typeComponents[0].maxOccurs && property.valueIds.length >= parseInt(typeComponents[0].maxOccurs)) {
                return false;
            } else {
                return true;
            }
        } else {
            if (property.maxOccurs && property.valueIds.length >= parseInt(property.maxOccurs)) {
                // rules on the contribution level
                return false;
            } else {
                return true;
            }
        }
    } else {
        return true;
    }
}

/**
 * Can delete property in resource
 * (check if minOccurs>=1)
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @param {String} propertyId Property ID
 * @return {Boolean} Whether it's possible to delete the property
 */
export function canDeleteProperty(state, resourceId, propertyId) {
    const property = state.statementBrowser.properties.byId[propertyId];
    if (property) {
        const typeComponents = getComponentsByResourceIDAndPredicateID(state, resourceId, property.existingPredicateId);
        if (typeComponents && typeComponents.length > 0) {
            if (typeComponents[0].minOccurs >= 1) {
                return false;
            } else {
                return true;
            }
        } else {
            if (property.minOccurs >= 1) {
                // rules on the contribution level
                return false;
            } else {
                return true;
            }
        }
    } else {
        return true;
    }
}

/**
 * Get suggested properties
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {Object[]} list of suggested components
 */
export function getSuggestedProperties(state, resourceId) {
    const components = getComponentsByResourceID(state, resourceId);
    const existingPropertyIds = getExistingPredicatesByResource(state, resourceId);

    return components.filter(x => !existingPropertyIds.includes(x.property.id));
}

export const deleteProperty = data => dispatch => {
    dispatch({
        type: type.DELETE_PROPERTY,
        payload: data
    });
};

export const toggleEditPropertyLabel = data => dispatch => {
    dispatch({
        type: type.TOGGLE_EDIT_PROPERTY_LABEL,
        payload: data
    });
};

export const changeProperty = data => dispatch => {
    dispatch({
        type: type.CHANGE_PROPERTY,
        payload: data
    });
};

export const doneAnimation = data => dispatch => {
    dispatch({
        type: type.DONE_ANIMATION,
        payload: data
    });
};

export const isDeletingProperty = data => dispatch => {
    dispatch({
        type: type.IS_DELETING_PROPERTY,
        payload: data
    });
};

export const doneDeletingProperty = data => dispatch => {
    dispatch({
        type: type.DONE_DELETING_PROPERTY,
        payload: data
    });
};

export const isSavingProperty = data => dispatch => {
    dispatch({
        type: type.IS_SAVING_PROPERTY,
        payload: data
    });
};

export const doneSavingProperty = data => dispatch => {
    dispatch({
        type: type.DONE_SAVING_PROPERTY,
        payload: data
    });
};

export const updatePropertyLabel = data => dispatch => {
    dispatch({
        type: type.UPDATE_PROPERTY_LABEL,
        payload: data
    });
};

/**
 * Update resource classes
 *
 * @param {Object} data - Resource Object
 * @param {String=} data.resourceId - resource ID
 * @param {Array=} data.classes - Classes of value
 */
export const updateResourceClasses = ({ resourceId, classes, syncBackend = false }) => (dispatch, getState) => {
    const resource = getState().statementBrowser.resources.byId[resourceId];
    if (resource) {
        dispatch({
            type: type.UPDATE_RESOURCE_CLASSES,
            payload: { resourceId, classes: uniq(classes?.filter(c => c) ?? []) }
        });
        // Fetch templates
        const templatesOfClassesLoading = classes && classes?.filter(c => c).map(classID => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
        // Add required properties
        Promise.all(templatesOfClassesLoading).then(() => dispatch(createRequiredPropertiesInResource(resourceId)));
        if (syncBackend) {
            return updateResourceClassesApi(resourceId, uniq(classes?.filter(c => c) ?? []));
        }
    }
    return Promise.resolve();
};

/**
 * Create Value then fetch templates
 *
 * @param {Object} data - Value Object
 * @param {String=} data.valueId - value ID
 * @param {String=} data.existingResourceId - Existing resource ID
 * @param {String=} data._class - The value type (resource|predicate|literal|class)
 * @param {Array=} data.classes - Classes of value
 */
export function createValue(data) {
    return dispatch => {
        const resourceId = data.existingResourceId ? data.existingResourceId : data._class === ENTITIES.RESOURCE ? guid() : null;

        dispatch({
            type: type.CREATE_VALUE,
            payload: {
                valueId: data.valueId ? data.valueId : guid(),
                resourceId: resourceId,
                ...data
            }
        });

        // Dispatch loading template of classes
        data.classes && data.classes.map(classID => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
        return Promise.resolve();
    };
}

export const toggleEditValue = data => dispatch => {
    dispatch({
        type: type.TOGGLE_EDIT_VALUE,
        payload: data
    });
};

export const changeValue = data => dispatch => {
    dispatch({
        type: type.CHANGE_VALUE,
        payload: data
    });
};

export const isSavingValue = data => dispatch => {
    dispatch({
        type: type.IS_SAVING_VALUE,
        payload: data
    });
};

export const doneSavingValue = data => dispatch => {
    dispatch({
        type: type.DONE_SAVING_VALUE,
        payload: data
    });
};

export const isAddingValue = data => dispatch => {
    dispatch({
        type: type.IS_ADDING_VALUE,
        payload: data
    });
};

export const doneAddingValue = data => dispatch => {
    dispatch({
        type: type.DONE_ADDING_VALUE,
        payload: data
    });
};

export const isDeletingValue = data => dispatch => {
    dispatch({
        type: type.IS_DELETING_VALUE,
        payload: data
    });
};

export const doneDeletingValue = data => dispatch => {
    dispatch({
        type: type.DONE_DELETING_VALUE,
        payload: data
    });
};

export const updateValueLabel = data => dispatch => {
    dispatch({
        type: type.UPDATE_VALUE_LABEL,
        payload: data
    });
};

export const deleteValue = data => dispatch => {
    dispatch({
        type: type.DELETE_VALUE,
        payload: data
    });
};

/**
 * Create Resource
 *
 * @param {Object} data - Resource Object
 * @param {String=} data.resourceId - Resource ID
 * @param {String=} data.existingResourceId - Existing resource ID
 * @param {String} data.label - Resource label
 * @param {Number} data.shared - Indicator number of incoming links to this resource
 * @param {Array} data.classes - Classes of the resource
 */
export const createResource = data => dispatch => {
    dispatch({
        type: type.CREATE_RESOURCE,
        payload: {
            resourceId: data.resourceId ? data.resourceId : guid(),
            label: data.label,
            existingResourceId: data.existingResourceId,
            shared: data.shared ? data.shared : 1,
            classes: data.classes ? data.classes : [],
            _class: data._class ? data._class : ENTITIES.RESOURCE
        }
    });
};

/**
 * Check if the template should be fetched
 *
 * @param {Object} state - Current state of the Store
 * @param {String} templateID - Template ID
 * @return {Boolean} if the template should be fetched or not
 */
function shouldFetchTemplate(state, templateID) {
    const template = state.statementBrowser.templates[templateID];
    if (!template) {
        return true;
    } else {
        return false;
    }
}

/**
 * Fetch template by ID
 *
 * @param {String} templateID - Template ID
 * @return {Promise} Promise object represents the template
 */
export function fetchTemplateIfNeeded(templateID) {
    return (dispatch, getState) => {
        if (shouldFetchTemplate(getState(), templateID)) {
            dispatch({
                type: type.IS_FETCHING_TEMPLATE_DATA,
                templateID
            });
            return getTemplateById(templateID).then(template => {
                // Add template to the global state
                dispatch({
                    type: type.DONE_FETCHING_TEMPLATE_DATA,
                    templateID
                });
                dispatch({ type: type.CREATE_TEMPLATE, payload: template });
                return template;
            });
        } else {
            // Let the calling code know there's nothing to wait for.
            const template = getState().statementBrowser.templates[templateID];
            return Promise.resolve(template);
        }
    };
}

/**
 * Check if the property has a template context
 *
 * @param {Object} state - Current state of the Store
 * @param {String} propertyId - Property ID
 */
export function isTemplateContextProperty(state, propertyId) {
    // template.predicate && template?.predicate.id !== PREDICATES.HAS_CONTRIBUTION;
    const property = state.statementBrowser.properties.byId[propertyId];
    if (property) {
        for (const valueId of property.valueIds) {
            const value = state.statementBrowser.values.byId[valueId];
            // Get all template ids
            const templateIds = getTemplateIDsByResourceID(state, value.resourceId);
            // Check if one of the template is strict
            for (const templateId of templateIds) {
                const template = state.statementBrowser.templates[templateId];

                if (template && template?.predicate?.id === property.existingPredicateId) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Fill a resource with a template
 *
 * @param {String} templateID - Template ID
 * @param {String} selectedResource - The resource to fill with the template
 * @param {Boolean} syncBackend - syncBackend
 * @return {Promise} Promise object
 */
export function fillResourceWithTemplate({ templateID, resourceId, syncBackend = false }) {
    return async (dispatch, getState) => {
        return dispatch(fetchTemplateIfNeeded(templateID)).then(async templateDate => {
            const template = templateDate;
            // Check if it's a template
            if (template && template?.components?.length > 0) {
                // TODO : handle the case where the template isFetching
                if (!template.predicate || template?.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                    // update the class of the current resource
                    dispatch(
                        updateResourceClasses({
                            resourceId,
                            classes: [...getState().statementBrowser.resources.byId[resourceId].classes, template.class.id],
                            syncBackend: syncBackend
                        })
                    );
                    // Add properties
                    const statements = { properties: [], values: [] };
                    for (const component of template?.components) {
                        statements['properties'].push({
                            existingPredicateId: component.property.id,
                            label: component.property.label
                        });
                    }
                    dispatch(fillStatements({ statements, resourceId, syncBackend }));
                } else if (template.predicate) {
                    // Add template to the statement browser
                    const statements = { properties: [], values: [] };
                    const pID = guid();
                    const vID = guid();
                    let instanceResourceId = guid();
                    statements['properties'].push({
                        propertyId: pID,
                        existingPredicateId: template.predicate.id,
                        label: template.predicate.label,
                        isAnimated: false,
                        canDuplicate: true
                    });
                    if (syncBackend) {
                        const newObject = await createResourceApi(template.label, template.class ? [template.class.id] : []);
                        instanceResourceId = newObject.id;
                    }
                    statements['values'].push({
                        valueId: vID,
                        label: template.label,
                        existingResourceId: instanceResourceId,
                        _class: ENTITIES.RESOURCE,
                        propertyId: pID,
                        classes: template.class ? [template.class.id] : []
                    });
                    await dispatch(fillStatements({ statements, resourceId: resourceId, syncBackend }));
                    // Add properties
                    const instanceStatements = { properties: [], values: [] };
                    for (const component of template?.components) {
                        instanceStatements['properties'].push({
                            existingPredicateId: component.property.id,
                            label: component.property.label
                        });
                    }
                    await dispatch(
                        fillStatements({
                            statements: instanceStatements,
                            resourceId: instanceResourceId,
                            syncBackend: syncBackend
                        })
                    );
                }
            }
            return Promise.resolve();
        });
    };
}

/**
 * Check if the class template should be fetched
 *
 * @param {Object} state - Current state of the Store
 * @param {String} classID - Class ID
 * @return {Boolean} if the class template should be fetched or not
 */
function shouldFetchTemplatesOfClass(state, classID) {
    const classObj = state.statementBrowser.classes[classID];
    if (!classObj) {
        return true;
    } else {
        return false;
    }
}

/**
 * Fetch templates of class
 *
 * @param {String} classID - Class ID
 */
export function fetchTemplatesOfClassIfNeeded(classID) {
    return (dispatch, getState) => {
        if (shouldFetchTemplatesOfClass(getState(), classID)) {
            dispatch({
                type: type.IS_FETCHING_TEMPLATES_OF_CLASS,
                classID
            });
            return getTemplatesByClass(classID).then(async templateIds => {
                dispatch({
                    type: type.DONE_FETCHING_TEMPLATES_OF_CLASS,
                    classID
                });

                return await Promise.all(templateIds.map(templateId => dispatch(fetchTemplateIfNeeded(templateId))));
            });
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve();
        }
    };
}

/**
 * Select resource
 *
 * @param {Object} data
 * @param {Boolean} data.increaseLevel - Increase statement browser level
 * @param {String} data.resourceId - Resource ID
 * @param {String} data.label - Resource Label
 * @param {Boolean} data.resetLevel - Reset statement browser level
 * @return {Promise} Promise object of creating the required properties
 */
export function selectResource(data) {
    return dispatch => {
        // use redux thunk for async action, for capturing the resource properties
        dispatch({
            type: type.SELECT_RESOURCE,
            payload: {
                increaseLevel: data.increaseLevel,
                resourceId: data.resourceId,
                label: data.label
            }
        });

        dispatch({
            type: type.ADD_RESOURCE_HISTORY,
            payload: {
                resourceId: data.resourceId,
                label: data.label,
                propertyLabel: data.propertyLabel
            }
        });

        if (data.resetLevel) {
            dispatch({
                type: type.RESET_LEVEL
            });
        }
        return Promise.resolve().then(() => dispatch(createRequiredPropertiesInResource(data.resourceId)));
    };
}

export const goToResourceHistory = data => (dispatch, getState) => {
    if (!getState().statementBrowser.resources.byId[data.id]) {
        dispatch(
            fetchStatementsForResource({
                resourceId: data.id
            })
        );
    }
    dispatch({
        type: type.GOTO_RESOURCE_HISTORY,
        payload: data
    });
};

export const updateContributionLabel = data => dispatch => {
    dispatch({
        type: type.STATEMENT_BROWSER_UPDATE_CONTRIBUTION_LABEL,
        payload: data
    });
};

/**
 * Check if it should fetch statements for resources
 *
 * @param {Object} state - Current state of the Store
 * @param {String} resourceId - Resource ID
 * @param {Number} depth - The required depth
 * @return {Boolean} if the resource statements should be fetched or not
 */
function shouldFetchStatementsForResource(state, resourceId, depth, nodeType) {
    const resource = state.statementBrowser.resources.byId[resourceId];
    // We should not load if the node is a literal or it doesn't exist in the backend
    if (
        nodeType !== ENTITIES.LITERAL &&
        (!resource || (resource.existingResourceId && !resource.isFetched) || (resource.isFetched && resource.fetchedDepth < depth))
    ) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if it should add a statement for resources
 *
 * @param {Object} state - Current state of the Store
 * @param {String} statementId - Statement ID
 * @return {Boolean} if the statement should be added or not
 */
function statementExists(state, statementId) {
    return !!state.statementBrowser.values.allIds.find(id => state.statementBrowser.values.byId[id].statementId === statementId);
}

/**
 * Recursive function to add statements to a resource
 *
 * @param {Array} statements - Statements
 * @param {String} resourceId - The subject id in the SB
 * @param {String} depth - The current depth
 */
export function addStatements(statements, resourceId, depth) {
    return (dispatch, getState) => {
        let resourceStatements = filterStatementsBySubjectId(statements, resourceId);
        // Sort predicates and values by label
        resourceStatements = orderBy(
            resourceStatements,
            [
                resourceStatements => resourceStatements.predicate.label.toLowerCase(),
                resourceStatements => resourceStatements.object.label.toLowerCase()
            ],
            ['asc']
        );

        return Promise.all(
            resourceStatements.map(statement => {
                // Check whether there already exist a property for this, then combine
                let propertyId = getPropertyIdByByResourceAndPredicateId(getState(), resourceId, statement.predicate.id);
                if (!propertyId) {
                    // Create the property
                    propertyId = guid();
                    dispatch(
                        createProperty({
                            propertyId: propertyId,
                            resourceId: resourceId,
                            existingPredicateId: statement.predicate.id,
                            isExistingProperty: true,
                            ...statement.predicate
                        })
                    );
                }
                let addStatement = Promise.resolve();
                if (!statementExists(getState(), statement.id)) {
                    // add the value if the statement doesn't exist
                    const valueId = guid();
                    addStatement = dispatch(
                        createValue({
                            valueId: valueId,
                            existingResourceId: statement.object.id,
                            propertyId: propertyId,
                            isExistingValue: true,
                            existingStatement: true,
                            statementId: statement.id,
                            statementCreatedBy: statement.created_by,
                            statementCreatedAt: statement.created_at,
                            isFetched: depth > 1 ? true : false,
                            fetchedDepth: depth - 1,
                            ...statement.object
                        })
                    );
                }
                return addStatement.then(() => {
                    if (filterStatementsBySubjectId(statements, statement.object.id)?.length) {
                        // Add required properties and add statements
                        return dispatch(createRequiredPropertiesInResource(statement.object.id))
                            .then(() => dispatch(addStatements(statements, statement.object.id, depth - 1)))
                            .then(() => {
                                // Set the resource as fetched
                                dispatch({
                                    type: type.SET_STATEMENT_IS_FETCHED,
                                    resourceId: statement.object.id,
                                    depth: depth - 1
                                });
                            });
                    } else {
                        return Promise.resolve();
                    }
                });
            })
        );
    };
}

/**
 * Fetch statements of a resource
 *
 * @param {String} resourceId - Resource ID
 * @param {String} rootNodeType - root node type (predicate|resource|class), no resolving endpoint yet!
 * @param {Number} depth - The required depth
 * @return {Promise} Promise object
 */
export const fetchStatementsForResource = ({ resourceId, rootNodeType = ENTITIES.RESOURCE, depth = 1 }) => {
    return (dispatch, getState) => {
        if (shouldFetchStatementsForResource(getState(), resourceId, depth, rootNodeType)) {
            dispatch({
                type: type.IS_FETCHING_STATEMENTS,
                resourceId: resourceId
            });
            // Get the resource classes
            return getEntity(rootNodeType, resourceId)
                .then(root => {
                    // We have custom templates for predicates and classes
                    // so add the corresponding classes on the root node
                    const mapEntitiesClasses = {
                        [ENTITIES.PREDICATE]: [CLASSES.PREDICATE],
                        [ENTITIES.CLASS]: [CLASSES.CLASS],
                        [ENTITIES.RESOURCE]: root.classes ?? []
                    };
                    let allClasses = mapEntitiesClasses[rootNodeType];
                    // set the resource classes (initialize doesn't set the classes)
                    dispatch(updateResourceClasses({ resourceId, classes: allClasses, syncBackend: false }));
                    // fetch the statements
                    return getStatementsBundleBySubject({ id: resourceId, maxLevel: depth }).then(response => {
                        // 1 - collect all classes Ids
                        allClasses = uniq([
                            ...allClasses,
                            ...flatten(
                                response.statements
                                    .map(s => s.object)
                                    .filter(o => o.classes)
                                    .map(o => o.classes)
                            )
                        ]);
                        // 3 - load templates
                        const templatesOfClassesLoading = allClasses && allClasses?.map(classID => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
                        return Promise.all(templatesOfClassesLoading)
                            .then(() => dispatch(createRequiredPropertiesInResource(resourceId))) // Add required properties
                            .then(() => dispatch(addStatements(response.statements, resourceId, depth))) // Add statements
                            .then(() => {
                                // Set fetching is done
                                dispatch({
                                    type: type.DONE_FETCHING_STATEMENTS
                                });
                                dispatch({
                                    type: type.SET_STATEMENT_IS_FETCHED,
                                    resourceId: resourceId,
                                    depth: depth
                                });
                            });
                    });
                })
                .catch(() => {
                    dispatch({
                        type: type.FAILED_FETCHING_STATEMENTS,
                        resourceId: resourceId
                    });
                });
        } else {
            return Promise.resolve();
        }
    };
};

/**
 * Check if the input filed is Literal
 *  (if one of the default data type: Date, String, Number)
 * @param {Object[]} components Array of components
 * @return {Boolean} if this input field is Literal
 */
export const isLiteral = components => {
    let isLiteral = false;
    for (const typeId of components.map(tc => tc.value?.id)) {
        if (
            DATA_TYPES.filter(dt => dt._class === ENTITIES.LITERAL)
                .map(t => t.classId)
                .includes(typeId)
        ) {
            isLiteral = true;
            break;
        }
    }
    return isLiteral;
};

/**
 * Get the type of value
 * @param {Object[]} components Array of components
 * @return {Object=} the class of value or null
 */
export const getValueClass = components => {
    return components && components.length > 0 && components[0].value && components[0].value.id ? components[0].value : null;
};

/**
 * Check if the class has an inline format
 * (its template has hasLabelFormat == true)
 * @param {Object} state Current state of the Store
 * @param {Object[]} valueClass Class ID
 * @return {String|Boolean} the template label or false
 */
export function isInlineResource(state, valueClass) {
    if (
        valueClass &&
        !DATA_TYPES.filter(dt => dt._class === ENTITIES.LITERAL)
            .map(t => t.classId)
            .includes(valueClass.id)
    ) {
        if (state.statementBrowser.classes[valueClass.id] && state.statementBrowser.classes[valueClass.id].templateIds) {
            const templateIds = state.statementBrowser.classes[valueClass.id].templateIds;
            //check if it's an inline resource
            for (const templateId of templateIds) {
                const template = state.statementBrowser.templates[templateId];
                if (template && template.hasLabelFormat) {
                    return template.label;
                }
            }
        }
    }
    return false;
}

/**
 * Check if a value has an inline format
 * (its template has hasLabelFormat == true)
 * @param {Object} state Current state of the Store
 * @param {Object[]} valueId Value ID
 * @return {Boolean} true or false
 */
export function isValueHasFormattedLabel(state, valueId) {
    const value = state.statementBrowser.values.byId[valueId];
    return value.classes?.some(elt => isInlineResource(state, elt));
}

/**
 * Get formatted label of resource
 * @param {String} resource Resource object
 * @param {String} labelFormat Current state of the Store
 * @return {String} Formatted label
 */
export function generatedFormattedLabel(resource, labelFormat) {
    return (dispatch, getState) => {
        const valueObject = {};
        for (const propertyId of resource.propertyIds) {
            const property = getState().statementBrowser.properties.byId[propertyId];
            valueObject[property.existingPredicateId] =
                property?.valueIds && property.valueIds.length > 0
                    ? getState().statementBrowser.values.byId[property.valueIds[0]].label
                    : property.label;
        }
        if (Object.keys(valueObject).length > 0) {
            return format(labelFormat, valueObject);
        } else {
            return resource.label;
        }
    };
}
