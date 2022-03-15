import * as type from './types.js';
import {
    createResourceAction as createResource,
    fetchStatementsForResource,
    selectResourceAction as selectResource,
    clearResourceHistory,
    createContributionObject,
    loadContributionHistory
} from 'slices/statementBrowserSlice';

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
        dispatch(
            createContributionObject({
                id
            })
        );

        dispatch(
            fetchStatementsForResource({
                resourceId: id,
                depth: 3 // load depth 3 the first time
            })
        );
        dispatch(clearResourceHistory());
    }
    // this will create or set the selected contribution id in the statementBrowser (HERE SELECT)
    Promise.resolve(
        dispatch(
            createContributionObject({
                id
            })
        )
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
        dispatch(
            loadContributionHistory({
                id
            })
        );
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

export const isDeletingContribution = data => dispatch => {
    dispatch({
        type: type.IS_DELETING_CONTRIBUTION,
        payload: data
    });
};

export const doneDeletingContribution = data => dispatch => {
    dispatch({
        type: type.DONE_DELETING_CONTRIBUTION,
        payload: data
    });
};

export const isSavingContribution = data => dispatch => {
    dispatch({
        type: type.IS_SAVING_CONTRIBUTION,
        payload: data
    });
};

export const doneSavingContribution = data => dispatch => {
    dispatch({
        type: type.DONE_SAVING_CONTRIBUTION,
        payload: data
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
