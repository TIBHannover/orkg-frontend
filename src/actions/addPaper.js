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

export const createContribution = (data) => dispatch => {
    dispatch({
        type: type.CREATE_CONTRIBUTION,
        payload: {
            id: guid(),
            resourceId: guid(),
        }
    })
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
    })
}

export const updateResearchProblems = (data) => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data
    })
}

export const createProperty = (data) => dispatch => {
    dispatch({
        type: type.CREATE_PROPERTY,
        payload: {
            propertyId: guid(),
            ...data,
            /*resourceId: data.resourceId,
            existingPredicateId: data.existingPredicateId,
            label: data.label,*/
        }
    })
}