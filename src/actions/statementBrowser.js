import * as type from './types.js';
import { guid } from 'utils';
import * as network from 'network';
import { orderBy, uniq, isEqual } from 'lodash';

export const updateSettings = data => dispatch => {
    dispatch({
        type: type.STATEMENT_BROWSER_UPDATE_SETTINGS,
        payload: data
    });
};

/**
 * Initialise the statement browser without contibution
 * (e.g : new store to show resource in dialog)
 * @param {Object} data - Initial resource
 * @param {string} data.label - The label of the resource.
 * @param {string} data.resourceId - The resource id.
 */
export const initializeWithoutContribution = data => dispatch => {
    // To initialise:
    // 1. Create a resource (the one that is requested), so properties can be connected to this
    // 2. Select this resource (only a selected resource is shown)
    // 3. Fetcht the statements related to this resource

    const label = data.label;
    const resourceId = data.resourceId;
    const rootNodeType = data.rootNodeType;

    dispatch(
        createResource({
            label: label,
            existingResourceId: resourceId,
            resourceId: resourceId,
            ...(rootNodeType === 'predicate' ? { classes: ['Predicate'] } : {})
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
            rootNodeType: rootNodeType
        })
    );
};

/**
 * Initialise the statement browser with a resource then add the required properties
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
export function getReseachProblemsOfContribution(state, resourceId) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }
    if (resource && resource.propertyIds) {
        const researchProblemProperty = resource.propertyIds.find(
            p => state.statementBrowser.properties.byId[p].existingPredicateId === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM
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
 * Get tempalte IDs by resource ID
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
export function getComponentsByResourceID(state, resourceId) {
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
        if (template && template.components) {
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
                const isExstingProperty = resource.propertyIds.find(p => {
                    if (getState().statementBrowser.properties.byId[p].existingPredicateId === data.existingPredicateId) {
                        if (data.range) {
                            // if the range is set check the equality also
                            return isEqual(data.range, getState().statementBrowser.properties.byId[p].range) ? true : false;
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                });
                if (isExstingProperty) {
                    // Property already exists
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
    const typeComponents = getComponentsByResourceIDAndPredicateID(state, resourceId, property.existingPredicateId);
    if (typeComponents && typeComponents.length > 0 && typeComponents[0].maxOccurs) {
        if (property.valueIds.length >= parseInt(typeComponents[0].maxOccurs)) {
            return false;
        } else {
            return true;
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
    const typeComponents = getComponentsByResourceIDAndPredicateID(state, resourceId, property.existingPredicateId);
    if (typeComponents && typeComponents.length > 0 && typeComponents[0].minOccurs >= 1) {
        return false;
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
export const updateResourceClasses = data => dispatch => {
    dispatch({
        type: type.UPDATE_RESOURCE_CLASSES,
        payload: data
    });
    return Promise.resolve();
};

/**
 * Create Value then fetch templates
 *
 * @param {Object} data - Value Object
 * @param {String=} data.valueId - value ID
 * @param {String=} data.existingResourceId - Existing resource ID
 * @param {String=} data.type - Type of value (object|template)
 * @param {Array=} data.classes - Classes of value
 */
export function createValue(data) {
    return dispatch => {
        const resourceId = data.existingResourceId ? data.existingResourceId : data.type === 'object' || data.type === 'template' ? guid() : null;

        dispatch({
            type: type.CREATE_VALUE,
            payload: {
                valueId: data.valueId ? data.valueId : guid(),
                resourceId: resourceId,
                ...data
            }
        });

        // Dispatch loading template of classes
        data.classes && data.classes.map(classID => dispatch(fetchTemplatesofClassIfNeeded(classID)));
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
            classes: data.classes ? data.classes : []
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
            return network.getTemplateById(templateID).then(template => {
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
 * Check if the class template should be fetched
 *
 * @param {Object} state - Current state of the Store
 * @param {String} classID - Class ID
 * @return {Boolean} if the class template should be fetched or not
 */
function shouldFetchTemplatesofClass(state, classID) {
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
export function fetchTemplatesofClassIfNeeded(classID) {
    return (dispatch, getState) => {
        if (shouldFetchTemplatesofClass(getState(), classID)) {
            dispatch({
                type: type.IS_FETCHING_TEMPLATES_OF_CLASS,
                classID
            });
            return network.getTemplatesByClass(classID).then(async templateIds => {
                dispatch({
                    type: type.DONE_FETCHING_TEMPLATES_OF_CLASS,
                    classID
                });

                return await Promise.all(templateIds.map(tempalteId => dispatch(fetchTemplateIfNeeded(tempalteId))));
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

export const goToResourceHistory = data => dispatch => {
    dispatch({
        type: type.GOTO_RESOURCE_HISTORY,
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
function shouldFetchStatementsForResource(state, resourceId, depth) {
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource || !resource.isFechted || (resource.isFechted && resource.fetshedDepth < depth)) {
        return true;
    } else {
        return false;
    }
}

// TODO: support literals (currently not working in backend)
/**
 * Fetch statemments of a resource
 *
 * @param {Object} data
 * @param {String} data.resourceId - Resource ID
 * @param {String} data.existingResourceId - Existing resource ID
 * @param {Boolean} data.isContribution - If the resource if a contribution
 * @param {Number} data.depth - The required depth
 * @return {Promise} Promise object
 */
export const fetchStatementsForResource = data => {
    let { isContribution, depth, rootNodeType } = data;
    const { resourceId, existingResourceId } = data;
    isContribution = isContribution ? isContribution : false;

    if (typeof depth == 'number') {
        depth = depth - 1;
    } else {
        depth = 0;
    }

    rootNodeType = rootNodeType ?? 'resource';

    let resourceStatements = [];

    // Get the resource classes
    return (dispatch, getState) => {
        if (shouldFetchStatementsForResource(getState(), existingResourceId, depth)) {
            dispatch({
                type: type.IS_FETCHING_STATEMENTS,
                resourceId: resourceId
            });
            let subject;
            if (rootNodeType === 'predicate') {
                subject = network.getPredicate(existingResourceId);
            } else {
                subject = network.getResource(existingResourceId);
            }

            return subject.then(response => {
                let promises;
                // fetch the statements
                const resourceStatementsPromise = network.getStatementsBySubject({ id: existingResourceId }).then(response => {
                    resourceStatements = response;
                    return Promise.resolve();
                });
                if (rootNodeType === 'predicate') {
                    // get templates of classes
                    const predicateClass = dispatch(fetchTemplatesofClassIfNeeded(process.env.REACT_APP_CLASSES_PREDICATE));
                    promises = Promise.all([predicateClass, resourceStatementsPromise]);
                } else {
                    let resourceClasses = response.classes ?? [];
                    // get templates of classes
                    if (resourceClasses && resourceClasses.length > 0) {
                        resourceClasses = resourceClasses.map(classID => dispatch(fetchTemplatesofClassIfNeeded(classID)));
                    }
                    // set the resource classes (initialize doesn't set the classes)
                    const resourceUpdateClasses = dispatch(updateResourceClasses({ resourceId, classes: response.classes }));
                    promises = Promise.all([resourceUpdateClasses, resourceStatementsPromise, ...resourceClasses]);
                }

                return promises
                    .then(() => dispatch(createRequiredPropertiesInResource(resourceId)))
                    .then(existingProperties => {
                        // all the template of classes are loaded
                        // add the required proerty first
                        const researchProblems = [];

                        // Sort predicates and values by label
                        resourceStatements = orderBy(
                            resourceStatements,
                            [
                                resourceStatements => resourceStatements.predicate.label.toLowerCase(),
                                resourceStatements => resourceStatements.object.label.toLowerCase()
                            ],
                            ['asc']
                        );

                        // Finished the call
                        dispatch({
                            type: type.DONE_FETCHING_STATEMENTS
                        });

                        for (const statement of resourceStatements) {
                            let propertyId = guid();
                            const valueId = guid();
                            // filter out research problem to show differently
                            if (isContribution && statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM) {
                                researchProblems.push({
                                    label: statement.object.label,
                                    id: statement.object.id,
                                    statementId: statement.id
                                });
                            } else {
                                // check whether there already exist a property for this, then combine
                                if (existingProperties.filter(e => e.existingPredicateId === statement.predicate.id).length === 0) {
                                    dispatch(
                                        createProperty({
                                            propertyId: propertyId,
                                            resourceId: resourceId,
                                            existingPredicateId: statement.predicate.id,
                                            label: statement.predicate.label,
                                            isExistingProperty: true,
                                            isTemplate: false
                                        })
                                    );

                                    existingProperties.push({
                                        existingPredicateId: statement.predicate.id,
                                        propertyId
                                    });
                                } else {
                                    propertyId = existingProperties.filter(e => e.existingPredicateId === statement.predicate.id)[0].propertyId;
                                }

                                dispatch(
                                    createValue({
                                        valueId: valueId,
                                        existingResourceId: statement.object.id,
                                        propertyId: propertyId,
                                        label: statement.object.label,
                                        type: statement.object._class === 'resource' ? 'object' : statement.object._class, // TODO: change 'object' to 'resource' (wrong term used here, since it is always an object)
                                        classes: statement.object.classes ? statement.object.classes : [],
                                        ...(statement.object._class === 'literal' && {
                                            datatype: statement.object.datatype ?? process.env.REACT_APP_DEFAULT_LITERAL_DATATYPE
                                        }),
                                        isExistingValue: true,
                                        existingStatement: true,
                                        statementId: statement.id,
                                        shared: statement.object.shared
                                    })
                                ).then(() => {
                                    if (depth >= 1 && statement.object._class === 'resource') {
                                        dispatch(
                                            fetchStatementsForResource({
                                                existingResourceId: statement.object.id,
                                                resourceId: statement.object.id,
                                                depth: depth
                                            })
                                        );
                                    }
                                });

                                //Load template of objects
                                statement.object.classes && statement.object.classes.map(classID => dispatch(fetchTemplatesofClassIfNeeded(classID)));
                            }
                        }

                        if (isContribution) {
                            dispatch({
                                type: type.SET_RESEARCH_PROBLEMS,
                                payload: {
                                    researchProblems,
                                    resourceId
                                }
                            });
                        }

                        dispatch({
                            type: type.SET_STATEMENT_IS_FECHTED,
                            resourceId: resourceId,
                            depth: depth
                        });
                    });
            });
        } else {
            return Promise.resolve();
        }
    };
};
