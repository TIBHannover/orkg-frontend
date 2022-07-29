import { createSlice } from '@reduxjs/toolkit';
import { asyncLocalStorage } from 'utils';
import {
    createResourceAction as createResource,
    fetchStatementsForResource,
    selectResourceAction as selectResource,
    clearResourceHistory,
    createContributionObject,
    loadContributionHistory,
} from 'slices/statementBrowserSlice';

const initialState = {
    comparison: {
        byId: {},
        allIds: [],
    },
    paperResource: {
        id: '',
        label: '',
        created_at: null,
        classes: [],
        shared: 0,
        created_by: '00000000-0000-0000-0000-000000000000',
        observatory_id: '00000000-0000-0000-0000-000000000000',
        extraction_method: 'UNKNOWN',
        organization_id: '00000000-0000-0000-0000-000000000000',
    },
    authors: [],
    publicationMonth: {},
    publicationYear: {},
    doi: {},
    researchField: {},
    verified: false,
    publishedIn: {},
    url: {},
    isAddingContribution: false,
};

export const viewPaperSlice = createSlice({
    name: 'viewPaper',
    initialState,
    reducers: {
        loadPaper: (state, { payload }) => ({
            ...state,
            ...payload,
        }),
        setIsAddingContribution: (state, { payload }) => {
            state.isAddingContribution = payload;
        },
        setIsDeletingContribution: (state, { payload: { id, status } }) => {
            state.contributions[state.contributions.map(c => c.id).indexOf(id)].isSaving = status;
        },
        setIsSavingContribution: (state, { payload: { id, status } }) => {
            state.contributions[state.contributions.map(c => c.id).indexOf(id)].isSaving = status;
        },
        setPaperContributions: (state, { payload }) => {
            state.contributions = payload;
        },
        setPaperAuthors: (state, { payload }) => {
            state.authors = payload;
        },
        setPaperObservatory: (state, { payload }) => {
            state.paperResource.observatory_id = payload.observatory_id;
            state.paperResource.organization_id = payload.organization_id;
        },
        loadComparisonFromLocalStorage: (state, { payload }) => {
            state.comparison = payload;
        },
        addToComparison: (state, { payload }) => {
            state.comparison.byId[payload.contributionId] = payload.contributionData;
            state.comparison.allIds.push(payload.contributionId);
            asyncLocalStorage.setItem('comparison', JSON.stringify(state.comparison));
        },
        removeFromComparison: (state, { payload }) => {
            delete state.comparison.byId[payload];
            state.comparison.allIds = state.comparison.allIds.filter(id => id !== payload);
            asyncLocalStorage.setItem('comparison', JSON.stringify(state.comparison));
        },
    },
});

export const {
    loadPaper,
    setIsAddingContribution,
    setIsDeletingContribution,
    setIsSavingContribution,
    setPaperContributions,
    setPaperAuthors,
    setPaperObservatory,
    loadComparisonFromLocalStorage,
    addToComparison,
    removeFromComparison,
} = viewPaperSlice.actions;

export default viewPaperSlice.reducer;

export const selectContribution = ({ contributionId: id, contributionLabel }) => (dispatch, getState) => {
    const contributionIsLoaded = !!getState().statementBrowser.resources.byId[id];

    if (!contributionIsLoaded) {
        // let resourceId = guid(); //use this as ID in the future, when changing the data is possible

        dispatch(
            createResource({
                // only needed for connecting properties, label is shown in the breadcrumb
                resourceId: id,
                label: contributionLabel,
                existingResourceId: id,
            }),
        );
        // this will create or set the selected contribution id in the statementBrowser (HERE CREATE)
        dispatch(
            createContributionObject({
                id,
            }),
        );

        dispatch(
            fetchStatementsForResource({
                resourceId: id,
                depth: 3, // load depth 3 the first time
            }),
        );
        dispatch(clearResourceHistory());
    }
    // this will create or set the selected contribution id in the statementBrowser (HERE SELECT)
    Promise.resolve(
        dispatch(
            createContributionObject({
                id,
            }),
        ),
    ).then(() => {
        dispatch(
            selectResource({
                increaseLevel: false,
                resourceId: id,
                label: contributionLabel,
                resetLevel: false,
            }),
        );

        // this will load the contribution data/history into the statementBrowser
        dispatch(
            loadContributionHistory({
                id,
            }),
        );
    });
};
