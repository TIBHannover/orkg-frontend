import { createSlice } from '@reduxjs/toolkit';

import { guid } from '@/utils';

const initialState = {
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
