import * as type from './types.js';
import { guid } from '../utils';
import * as network from '../network';

export const initializeWithoutContribution = (data) => dispatch => {
    // To initialise: 
    // 1. Create a resource (the one that is requested), so properties can be connected to this
    // 2. Select this resource (only a selected resource is shown)
    // 3. Fetcht the statements related to this resource

    const label = data.label;
    const resourceId = data.resourceId;

    dispatch(createResource({
        label: label,
        existingResourceId: resourceId,
        resourceId: resourceId,
    }));

    dispatch(selectResource({
        increaseLevel: false,
        resourceId: resourceId,
        label: label,
    }));

    dispatch(fetchStatementsForResource({
        existingResourceId: resourceId,
        resourceId: resourceId,
    }));
}

export const resetStatementBrowser = () => dispatch => {
    dispatch({
        type: type.RESET_STATEMENT_BROWSER,
    })
}

export const togglePropertyCollapse = (id) => dispatch => {
    dispatch({
        type: type.TOGGLE_PROPERTY_COLLAPSE,
        id
    })
}

export const createProperty = (data) => dispatch => {
    dispatch({
        type: type.CREATE_PROPERTY,
        payload: {
            propertyId: data.propertyId ? data.propertyId : guid(),
            ...data,
        }
    })
}

export const deleteProperty = (data) => dispatch => {
    dispatch({
        type: type.DELETE_PROPERTY,
        payload: data
    })
}

export const toggleEditPropertyLabel = (data) => dispatch => {
    dispatch({
        type: type.TOGGLE_EDIT_PROPERTY_LABEL,
        payload: data
    })
}

export const changeProperty = (data) => dispatch => {
    dispatch({
        type: type.CHANGE_PROPERTY,
        payload: data
    })
}

export const isSavingProperty = (data) => dispatch => {
    dispatch({
        type: type.IS_SAVING_PROPERTY,
        payload: data
    })
}

export const doneSavingProperty = (data) => dispatch => {
    dispatch({
        type: type.DONE_SAVING_PROPERTY,
        payload: data
    })
}

export const updatePropertyLabel = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_PROPERTY_LABEL,
        payload: data
    })
}

export const createValue = (data) => dispatch => {
    let resourceId = data.existingResourceId ? data.existingResourceId : (data.type === 'object' ? guid() : null);
    dispatch({
        type: type.CREATE_VALUE,
        payload: {
            valueId: data.valueId ? data.valueId : guid(),
            resourceId: resourceId,
            ...data,
        }
    })
}

export const toggleEditValue = (data) => dispatch => {
    dispatch({
        type: type.TOGGLE_EDIT_VALUE,
        payload: data
    })
}

export const updateValueLabel = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_VALUE_LABEL,
        payload: data
    })
}

export const deleteValue = (data) => dispatch => {
    dispatch({
        type: type.DELETE_VALUE,
        payload: data
    })
}

export const createResource = (data) => dispatch => {
    dispatch({
        type: type.CREATE_RESOURCE,
        payload: {
            resourceId: data.resourceId ? data.resourceId : guid(),
            label: data.label,
            existingResourceId: data.existingResourceId
        }
    })
}

export const selectResource = (data) => dispatch => { // use redux thunk for async action, for capturing the resource properties 
    dispatch({
        type: type.SELECT_RESOURCE,
        payload: {
            increaseLevel: data.increaseLevel,
            resourceId: data.resourceId,
            label: data.label,
        }
    });

    dispatch({
        type: type.ADD_RESOURCE_HISTORY,
        payload: {
            resourceId: data.resourceId,
            label: data.label,
        }
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });

    if (data.resetLevel) {
        dispatch({
            type: type.RESET_LEVEL
        });
    }
}

// TODO: support literals (currently not working in backend)
export const fetchStatementsForResource = (data) => {
    let { resourceId, existingResourceId, isContribution } = data;
    isContribution = isContribution ? isContribution : false;

    return (dispatch) => {
        dispatch({
            type: type.IS_FETCHING_STATEMENTS
        });
        return network.getStatementsBySubject({ id: existingResourceId })
            .then(
                response => {
                    dispatch({
                        type: type.DONE_FETCHING_STATEMENTS
                    });

                    let existingProperties = [];
                    let researchProblems = [];

                    for (let statement of response) {
                        let propertyId = guid();
                        const valueId = guid();
                        // filter out research problem to show differently
                        if (isContribution && statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM) {
                            researchProblems.push({
                                label: statement.object.label,
                                id: statement.object.id,
                            });
                        } else {
                            // check whether there already exist a property for this, then combine 
                            if (existingProperties.filter(e => e.existingPredicateId === statement.predicate.id).length === 0) {

                                dispatch(createProperty({
                                    propertyId: propertyId,
                                    resourceId: resourceId,
                                    existingPredicateId: statement.predicate.id,
                                    label: statement.predicate.label,
                                    isExistingProperty: true,
                                }));

                                existingProperties.push({
                                    existingPredicateId: statement.predicate.id,
                                    propertyId,
                                });
                            } else {
                                propertyId = existingProperties.filter(e => e.existingPredicateId === statement.predicate.id)[0].propertyId;
                            }

                            dispatch(createValue({
                                valueId: valueId,
                                existingResourceId: statement.object.id,
                                propertyId: propertyId,
                                label: statement.object.label,
                                type: statement.object._class === 'literal' ? 'literal' : 'object', // TODO: change 'object' to 'resource' (wrong term used here, since it is always an object)
                                classes: statement.object.classes ? statement.object.classes : [],
                                isExistingValue: true,
                                existingStatement: true,
                                statementId: statement.id
                            }));
                        }

                    }

                    if (isContribution) {
                        dispatch({
                            type: type.SET_RESEARCH_PROBLEMS,
                            payload: {
                                researchProblems,
                                resourceId,
                            }
                        });
                    }

                    dispatch({
                        type: type.SET_STATEMENT_IS_FECHTED,
                        resourceId: resourceId,
                    });
                },
                error => console.log('An error occurred.', error)
            )
    }
}

export const goToResourceHistory = (data) => dispatch => {
    dispatch({
        type: type.GOTO_RESOURCE_HISTORY,
        payload: data
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });
}