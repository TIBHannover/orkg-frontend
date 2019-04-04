import * as type from './types.js';
import { guid } from '../utils';

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

export const createContribution = ({selectAfterCreation = false}) => dispatch => {
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
    })
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
            propertyId: guid(),
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

export const createValue = (data) => dispatch => {
    dispatch({
        type: type.CREATE_VALUE,
        payload: {
            valueId: guid(),
            resourceId: data.type === 'object' ? guid() : null,
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

export const selectResource = (data) => dispatch => {
    dispatch({
        type: type.SELECT_RESOURCE,
        payload: data
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

export const goToResourceHistory = (data) => dispatch => {
    dispatch({
        type: type.GOTO_RESOURCE_HISTORY,
        payload: data
    });

    dispatch({
        type: type.CLEAR_SELECTED_PROPERTY
    });
}