import { createSlice } from '@reduxjs/toolkit';

import { asyncLocalStorage, guid } from '@/utils';

const initialState = {
    comparison: {
        byId: {},
        allIds: [],
    },
    abstract: '',
    isAbstractLoading: false,
    isAbstractFetched: false,
    isAbstractFailedFetching: false,
    fetchAbstractTitle: '',
    nerResources: [],
    nerProperties: [],
    nerRawResponse: {},
    predicatesRawResponse: {},
    bioassayText: '',
    bioassayRawResponse: [],
    ranges: {},
    abstractDialogView: 'annotator', // annotator | input | list
};

export const viewPaperSlice = createSlice({
    name: 'viewPaper',
    initialState,
    reducers: {
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
            state.comparison.allIds = state.comparison.allIds.filter((id) => id !== payload);
            asyncLocalStorage.setItem('comparison', JSON.stringify(state.comparison));
        },
        setAbstract: (state, { payload }) => {
            state.abstract = payload;
        },
        setIsAbstractLoading: (state, { payload }) => {
            state.isAbstractLoading = payload;
        },
        setIsAbstractFetched: (state, { payload }) => {
            state.isAbstractFetched = payload;
        },
        setIsAbstractFailedFetching: (state, { payload }) => {
            state.isAbstractFailedFetching = payload;
        },
        setFetchAbstractTitle: (state, { payload }) => {
            state.fetchAbstractTitle = payload;
        },
        setNerResources: (state, { payload }) => {
            state.nerResources = payload;
        },
        setNerProperties: (state, { payload }) => {
            state.nerProperties = payload;
        },
        setNerRawResponse: (state, { payload }) => {
            state.nerRawResponse = payload;
        },
        setPredicatesRawResponse: (state, { payload }) => {
            state.predicatesRawResponse = payload;
        },
        setBioassayText: (state, { payload }) => {
            state.bioassayText = payload;
        },
        setBioassayRawResponse: (state, { payload }) => {
            state.bioassayRawResponse = payload;
        },
        createAnnotation: (state, { payload }) => {
            const id = payload.id || guid();
            state.ranges[id] = {
                id,
                ...payload,
            };
        },
        removeAnnotation: (state, { payload }) => {
            const id = typeof payload === 'object' ? payload.id : payload;
            delete state.ranges[id];
        },
        toggleEditAnnotation: (state, { payload }) => {
            state.ranges[payload].isEditing = !state.ranges[payload].isEditing;
        },
        updateAnnotationPredicate: (state, { payload }) => {
            state.ranges[payload.range.id].predicate = {
                id: payload.selectedOption.id,
                label: payload.selectedOption.label,
            };
        },
        clearAnnotations: (state) => {
            state.ranges = {};
        },
        setAbstractDialogView: (state, { payload }) => {
            state.abstractDialogView = payload;
        },
    },
});

export const {
    loadComparisonFromLocalStorage,
    addToComparison,
    removeFromComparison,
    setAbstract,
    setIsAbstractLoading,
    setIsAbstractFetched,
    setIsAbstractFailedFetching,
    setFetchAbstractTitle,
    setNerResources,
    setNerProperties,
    setNerRawResponse,
    setPredicatesRawResponse,
    setBioassayText,
    setBioassayRawResponse,
    createAnnotation,
    removeAnnotation,
    toggleEditAnnotation,
    updateAnnotationPredicate,
    clearAnnotations,
    setAbstractDialogView,
} = viewPaperSlice.actions;

export default viewPaperSlice.reducer;
