import * as type from './types.js';
import { createResource, fetchStatementsForResource, selectResource } from './statementBrowser';

export const selectContribution = ({ contributionId: id, contributionLabel }) => (dispatch, getState) => {
    const contributionIsLoaded = !!getState().statementBrowser.resources.byId[id];

    if (!contributionIsLoaded) {
        //let resourceId = guid(); //use this as ID in the future, when changing the data is possible

        dispatch({
            type: type.CREATE_CONTRIBUTION,
            payload: {
                id: id,
                resourceId: id
            }
        });

        dispatch(
            createResource({
                //only needed for connecting properties, label is shown in the breadcrumb
                resourceId: id,
                label: contributionLabel,
                existingResourceId: id
            })
        );
        // this will create or set the selected contribution id in the statementBrowser (HERE CREATE)
        dispatch({
            type: type.STATEMENT_BROWSER_CREATE_CONTRIBUTION_OBJECT,
            payload: {
                id
            }
        });

        dispatch(
            fetchStatementsForResource({
                resourceId: id,
                isContribution: true,
                depth: 3 // load depth 3 the first time
            })
        );
        dispatch({
            type: type.CLEAR_RESOURCE_HISTORY
        });
    }
    // this will create or set the selected contribution id in the statementBrowser (HERE SELECT)
    Promise.resolve(
        dispatch({
            type: type.STATEMENT_BROWSER_CREATE_CONTRIBUTION_OBJECT,
            payload: {
                id
            }
        })
    ).then(() => {
        dispatch(
            selectResource({
                increaseLevel: false,
                resourceId: id,
                label: contributionLabel,
                resetLevel: false
            })
        );
        dispatch({
            type: type.SELECT_CONTRIBUTION,
            payload: {
                id
            }
        });

        // this will load the contribution data/history into the statementBrowser
        dispatch({
            type: type.STATEMENT_BROWSER_LOAD_CONTRIBUTION_HISTORY,
            payload: {
                id
            }
        });
    });
};

export const loadPaper = payload => dispatch => {
    dispatch({
        type: type.LOAD_PAPER,
        payload
    });
};

export const isAddingContribution = () => dispatch => {
    dispatch({
        type: type.IS_ADDING_CONTRIBUTION
    });
};

export const doneAddingContribution = () => dispatch => {
    dispatch({
        type: type.DONE_ADDING_CONTRIBUTION
    });
};

export const setPaperContributions = payload => dispatch => {
    dispatch({
        type: type.SET_PAPER_CONTRIBUTIONS,
        payload
    });
};

export const setPaperAuthors = payload => dispatch => {
    dispatch({
        type: type.SET_PAPER_AUTHORS,
        payload
    });
};

export const setPaperObservatory = payload => dispatch => {
    dispatch({
        type: type.SET_PAPER_OBSERVATORY,
        payload
    });
};

export const addToComparison = ({ contributionId, contributionData }) => dispatch => {
    dispatch({
        type: type.ADD_TO_COMPARISON,
        payload: {
            contributionId,
            contributionData
        }
    });
};

export const removeFromComparison = id => dispatch => {
    dispatch({
        type: type.REMOVE_FROM_COMPARISON,
        payload: {
            id
        }
    });
};

export const loadComparisonFromLocalStorage = cookie => dispatch => {
    dispatch({
        type: type.LOAD_COMPARISON_FROM_LOCAL_STORAGE,
        payload: {
            allIds: cookie.allIds,
            byId: cookie.byId
        }
    });
};

export const updateResearchProblems = data => dispatch => {
    dispatch({
        type: type.UPDATE_RESEARCH_PROBLEMS,
        payload: data
    });
};
