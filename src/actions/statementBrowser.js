import * as type from './types.js';
import { guid } from '../utils';
import * as network from '../network';
import { orderBy } from 'lodash';
import { uniq } from 'lodash';

export const initializeWithoutContribution = data => dispatch => {
    // To initialise:
    // 1. Create a resource (the one that is requested), so properties can be connected to this
    // 2. Select this resource (only a selected resource is shown)
    // 3. Fetcht the statements related to this resource

    const label = data.label;
    const resourceId = data.resourceId;

    dispatch(
        createResource({
            label: label,
            existingResourceId: resourceId,
            resourceId: resourceId
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
            resourceId: resourceId
        })
    );
};

export function initializeWithResource(data) {
    return (dispatch, getState) => {
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
        );

        createRequiredPropertiesInResource(resourceId);
    };
}

export function createRequiredPropertiesInResource(resourceId) {
    return (dispatch, getState) => {
        const createdProperties = [];
        const components = getComponentsByResourceID(getState(), resourceId);
        // add required properties (minOccurs >= 1)
        let propertyIds = getState().statementBrowser.resources.byId[resourceId].propertyIds;
        if (propertyIds) {
            propertyIds = propertyIds.map(propertyId => {
                const property = getState().statementBrowser.properties.byId[propertyId];
                return property.existingPredicateId;
            });
        } else {
            propertyIds = [];
        }

        components
            .filter(x => !propertyIds.includes(x.property.id))
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

        return createdProperties;
    };
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

export const togglePropertyCollapse = id => dispatch => {
    dispatch({
        type: type.TOGGLE_PROPERTY_COLLAPSE,
        id
    });
};

export function createProperty(data) {
    return (dispatch, getState) => {
        if (!data.canDuplicate && data.existingPredicateId) {
            const resource = getState().statementBrowser.resources.byId[data.resourceId];

            const isExstingProperty = resource.propertyIds.find(
                p => getState().statementBrowser.properties.byId[p].existingPredicateId === data.existingPredicateId
            );
            if (isExstingProperty) {
                // Property already exists
                return null;
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

export function createValue(data) {
    return (dispatch, getState) => {
        const resourceId = data.existingResourceId ? data.existingResourceId : data.type === 'object' || data.type === 'template' ? guid() : null;

        dispatch({
            type: type.CREATE_VALUE,
            payload: {
                valueId: data.valueId ? data.valueId : guid(),
                resourceId: resourceId,
                ...data
            }
        });

        // dispatch loading classes
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

export const createResource = data => dispatch => {
    dispatch({
        type: type.CREATE_RESOURCE,
        payload: {
            resourceId: data.resourceId ? data.resourceId : guid(),
            label: data.label,
            existingResourceId: data.existingResourceId,
            shared: data.shared ? data.shared : 1
        }
    });
};

/*
    Fetch template by ID
*/
function shouldFetchTemplate(state, templateID) {
    const template = state.statementBrowser.templates[templateID];
    if (!template) {
        return true;
    } else {
        return false;
    }
}

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
            return Promise.resolve();
        }
    };
}

export const setTemplateOfResource = data => {
    const templateId = data.templateId;
    return (dispatch, getState) => {
        return dispatch(fetchTemplateIfNeeded(templateId)).then(() => {
            dispatch({
                type: type.SET_TEMPLATE_OF_RESOURCE,
                payload: { ...data }
            });
        });
    };
};

/*
    Fetch templates by class ID
*/
function shouldFetchTemplatesofClass(state, classID) {
    const classObj = state.statementBrowser.classes[classID];
    if (!classObj) {
        return true;
    } else {
        return false;
    }
}

export function fetchTemplatesofClassIfNeeded(classID) {
    return (dispatch, getState) => {
        if (shouldFetchTemplatesofClass(getState(), classID)) {
            dispatch({
                type: type.IS_FETCHING_TEMPLATES_OF_CLASS,
                classID
            });
            return network.getTemplatesByClass(classID).then(templateIds => {
                dispatch({
                    type: type.DONE_FETCHING_TEMPLATES_OF_CLASS,
                    classID
                });
                return templateIds.map(tempalteId => dispatch(fetchTemplateIfNeeded(tempalteId)));
            });
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve();
        }
    };
}

export const selectResource = data => dispatch => {
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
            label: data.label
        }
    });

    if (data.resetLevel) {
        dispatch({
            type: type.RESET_LEVEL
        });
    }
};

export const fetchStructureForTemplate = data => {
    const { resourceId, templateId } = data;
    return dispatch => {
        dispatch({
            type: type.IS_FETCHING_STATEMENTS
        });
        return network.getTemplateById(templateId).then(
            template => {
                dispatch({
                    type: type.DONE_FETCHING_STATEMENTS
                });
                // Add properties
                if (template.components && template.components.length > 0) {
                    for (const component of template.components) {
                        dispatch(
                            createProperty({
                                resourceId: resourceId,
                                existingPredicateId: component.property.id,
                                label: component.property.label,
                                validationRules: component.validationRules,
                                isExistingProperty: true
                            })
                        );
                    }
                }

                // Tag resource with used template
                const ipID = guid();
                dispatch(
                    createProperty({
                        propertyId: ipID,
                        resourceId: resourceId,
                        existingPredicateId: process.env.REACT_APP_PREDICATES_INSTANCE_OF_TEMPLATE,
                        label: 'Instance Of Template',
                        isExistingProperty: true
                    })
                );
                dispatch(
                    createValue({
                        existingResourceId: templateId,
                        propertyId: ipID,
                        label: template.label,
                        type: 'object',
                        isExistingValue: true
                    })
                );

                // Add templates
                if (template.subTemplates && template.subTemplates.length > 0) {
                    for (const subTemplate of template.subTemplates) {
                        const tpID = guid();
                        //const tvID = guid();
                        dispatch(
                            createProperty({
                                resourceId: resourceId,
                                existingPredicateId: subTemplate.predicate.id,
                                propertyId: tpID,
                                label: subTemplate.predicate.label,
                                isExistingProperty: true,
                                templateId: subTemplate.id
                            })
                        );
                    }
                }
                dispatch({
                    type: type.SET_STATEMENT_IS_FECHTED,
                    resourceId: resourceId
                });
            },
            error => console.log('An error occurred.', error)
        );
    };
};

export const goToResourceHistory = data => dispatch => {
    dispatch({
        type: type.GOTO_RESOURCE_HISTORY,
        payload: data
    });
};

/*
    Get components of a resource
*/
export function getComponentsByResourceID(state, resourceID) {
    if (!resourceID) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceID];

    if (!resource) {
        return [];
    }
    // get template components
    // get all template ids
    let templateIds = resource.templateId ? [resource.templateId] : [];
    if (resource.classes) {
        for (const c of resource.classes) {
            if (state.statementBrowser.classes[c]) {
                templateIds = templateIds.concat(state.statementBrowser.classes[c].templateIds);
            }
        }
    }
    templateIds = uniq(templateIds);

    let components = [];
    // get components of this statement predicate
    for (const templateId of templateIds) {
        const template = state.statementBrowser.templates[templateId];
        if (template && template.components) {
            components = components.concat(template.components);
        }
    }
    return components;
}

/*
    Get components of a resource
*/
export function getComponentsByResourceIDAndPredicate(state, resourceID, predicateID) {
    const resourceComponents = getComponentsByResourceID(state, resourceID);
    if (resourceComponents.length === 0) {
        return [];
    }
    return resourceComponents.filter(c => c.property.id === predicateID);
}

/*
    Check if it should fetch statements for resources
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
export const fetchStatementsForResource = data => {
    let { isContribution, depth } = data;
    const { resourceId, existingResourceId } = data;
    isContribution = isContribution ? isContribution : false;

    if (typeof depth == 'number') {
        depth = depth - 1;
    } else {
        depth = 0;
    }

    let resourceStatements = [];

    // Get the resource classes
    return (dispatch, getState) => {
        if (shouldFetchStatementsForResource(getState(), existingResourceId, depth)) {
            dispatch({
                type: type.IS_FETCHING_STATEMENTS,
                resourceId: resourceId
            });
            return network.getResource(existingResourceId).then(response => {
                let resourceClasses = response.classes;
                // get templates of classes
                if (resourceClasses && resourceClasses.length > 0) {
                    resourceClasses = resourceClasses.map(classID => dispatch(fetchTemplatesofClassIfNeeded(classID)));
                }
                const instanceOfTemplate = network.getStatementsBySubject({ id: existingResourceId }).then(response => {
                    resourceStatements = response;
                    //Get template used to create this resource
                    const templateID = response.find(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_INSTANCE_OF_TEMPLATE);
                    if (templateID) {
                        return dispatch(
                            setTemplateOfResource({
                                resourceId: resourceId,
                                templateId: templateID.object.id
                            })
                        );
                    } else {
                        return Promise.resolve();
                    }
                });

                return Promise.all([instanceOfTemplate, ...resourceClasses])
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
                                        type: statement.object._class === 'literal' ? 'literal' : 'object', // TODO: change 'object' to 'resource' (wrong term used here, since it is always an object)
                                        classes: statement.object.classes ? statement.object.classes : [],
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
