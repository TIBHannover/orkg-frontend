import * as type from './types.js';
import { guid } from '../utils';
import { getStatementsBySubject } from '../network';

export const updateGeneralData = (data) => dispatch => {
    dispatch({
        type: type.UPFATE_GENERAL_DATA,
        payload: data,
    })
}

export const nextStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_NEXT_STEP,
    })
}

export const previousStep = () => dispatch => {
    dispatch({
        type: type.ADD_PAPER_PREVIOUS_STEP,
    })
}

export const updateResearchField = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_FIELD,
        payload: data,
    })
}

export const createContribution = ({ selectAfterCreation = false }) => dispatch => {
    let newResourceId = guid();
    let newContributionId = guid();

    dispatch({
        type: type.CREATE_CONTRIBUTION,
        payload: {
            id: newContributionId,
            resourceId: newResourceId,
        }
    });

    if (selectAfterCreation) {
        dispatch({
            type: type.ADD_RESOURCE_HISTORY,
            payload: {
                resourceId: newResourceId,
                label: 'Main',
            }
        });
    }
}

export const deleteContribution = (id) => dispatch => {
    dispatch({
        type: type.DELETE_CONTRIBUTION,
        payload: {
            id
        }
    });

    dispatch(selectContribution());
}

export const selectContribution = (id) => dispatch => {

    dispatch({
        type: type.SELECT_CONTRIBUTION,
        payload: {
            id
        }
    });

    dispatch({
        type: type.CLEAR_RESOURCE_HISTORY
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });

    dispatch({
        type: type.ADD_RESOURCE_HISTORY,
        payload: {
            //resourceId: id,
            label: 'Main',
        }
    });

}

export const updateResearchProblems = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data
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

export const deleteValue = (data) => dispatch => {
    dispatch({
        type: type.DELETE_VALUE,
        payload: data
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
}

export const fetchStatementsForResource = (data) => {
    const { resourceId, existingResourceId } = data;

    return (dispatch) => {
        return getStatementsBySubject(existingResourceId)
            .then(
                response => {
                    let existingProperties = [];

                    for (let statement of response) {
                        let propertyId = guid();
                        const valueId = guid();

                        // check whether there already exist a property for this, then combine 
                        //if (existingProperties.indexOf(statement.predicate.id) === -1) {
                        if (existingProperties.filter(e => e.existingPredicateId === statement.predicate.id).length === 0) {

                            dispatch(createProperty({
                                propertyId: propertyId,
                                resourceId: resourceId,
                                existingPredicateId: statement.predicate.id,
                                label: statement.predicate.label,
                            }));

                            existingProperties.push({
                                existingPredicateId: statement.predicate.id,
                                propertyId,
                            });
                        } else {
                            propertyId = existingProperties.filter(e => e.existingPredicateId === statement.predicate.id)[0].propertyId;
                            console.log(existingProperties.filter(e => e.existingPredicateId === statement.predicate.id));
                        }
                        

                        dispatch(createValue({
                            valueId: valueId,
                            existingResourceId: statement.object.id,
                            propertyId: propertyId,
                            label: statement.object.label,
                            type: 'object',
                        }));
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