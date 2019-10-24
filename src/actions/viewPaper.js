import * as type from './types.js';
import { createResource, fetchStatementsForResource, selectResource } from './statementBrowser';

export const selectContribution = ({ contributionId: id, contributionIsLoaded }) => dispatch => {

    if (!contributionIsLoaded) {
        //let resourceId = guid(); //use this as ID in the future, when changing the data is possible

        dispatch({
            type: type.CREATE_CONTRIBUTION,
            payload: {
                id: id,
                resourceId: id,
            }
        });

        dispatch(createResource({ //only needed for connecting properties, label is not shown
            resourceId: id,
            label: '',
            existingResourceId: id
        }));

        dispatch(fetchStatementsForResource({
            resourceId: id,
            existingResourceId: id,
            isContribution: true,
        }));
    }

    dispatch({
        type: type.CLEAR_RESOURCE_HISTORY
    });

    dispatch(selectResource({
        increaseLevel: false,
        resourceId: id,
        label: 'Main',
        resetLevel: true,
    }));

    dispatch({
        type: type.SELECT_CONTRIBUTION,
        payload: {
            id
        }
    });

}

export const loadPaper = (payload) => dispatch => {
    dispatch({
        type: type.LOAD_PAPER,
        payload
    });
}

export const addToComparison = ({ contributionId, contributionData }) => dispatch => {
    dispatch({
        type: type.ADD_TO_COMPARISON,
        payload: {
            contributionId,
            contributionData,
        }
    });
}

export const removeFromComparison = (id) => dispatch => {
    dispatch({
        type: type.REMOVE_FROM_COMPARISON,
        payload: {
            id,
        }
    });
}

export const loadComparisonFromCookie = (cookie) => dispatch => {
    dispatch({
        type: type.LOAD_COMPARISON_FROM_COOKIE,
        payload: {
            allIds: cookie.allIds,
            byId: cookie.byId,
        }
    });
}

export const updateResearchProblems = (data) => (dispatch) => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data,
    });
};