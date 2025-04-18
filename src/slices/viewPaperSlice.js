import { createSlice } from '@reduxjs/toolkit';
import { match } from 'path-to-regexp';

import { LOCATION_CHANGE } from '@/components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { asyncLocalStorage, guid } from '@/utils';

const initialState = {
    paper: {
        id: null,
        title: '',
        research_fields: [],
        identifiers: {},
        publication_info: {},
        authors: [],
        contributions: [],
        organizations: [],
        observatories: [],
        extraction_method: '',
        created_at: MISC.UNKNOWN_ID,
        created_by: MISC.UNKNOWN_ID,
        verified: false,
        visibility: 'default',
        unlisted_by: '',
        sdgs: [],
    },
    comparison: {
        byId: {},
        allIds: [],
    },
    contributions: [],
    abstract: '',
    isAbstractLoading: false,
    isAbstractFetched: false,
    isAbstractFailedFetching: false,
    fetchAbstractTitle: '',
    isAddingContribution: false,
    nerResources: [],
    nerProperties: [],
    nerRawResponse: {},
    predicatesRawResponse: {},
    bioassayText: '',
    bioassayRawResponse: [],
    ranges: {},
    abstractDialogView: 'annotator', // annotator | input | list
    version: null,
    originalPaperId: null,
    dataCiteDoi: null,
};

export const viewPaperSlice = createSlice({
    name: 'viewPaper',
    initialState,
    reducers: {
        loadPaper: (state, { payload }) => {
            state.paper = {
                ...state.paper,
                ...payload,
            };
        },
        setIsAddingContribution: (state, { payload }) => {
            state.isAddingContribution = payload;
        },
        setIsDeletingContribution: (state, { payload: { id, status } }) => {
            state.contributions[state.contributions.map((c) => c.id).indexOf(id)].isSaving = status;
        },
        setIsSavingContribution: (state, { payload: { id, status } }) => {
            state.contributions[state.contributions.map((c) => c.id).indexOf(id)].isSaving = status;
        },
        updatePaperContributionLabel: (state, { payload }) => {
            state.contributions = state.contributions.map((c) => {
                if (c.id === payload.id) {
                    return { ...c, label: payload.label };
                }
                return c;
            });
        },
        setPaperContributions: (state, { payload }) => {
            state.contributions = payload;
        },
        setPaperAuthors: (state, { payload }) => {
            state.authors = payload;
        },
        setVersion: (state, { payload }) => {
            state.version = payload;
        },
        setOriginalPaperId: (state, { payload }) => {
            state.originalPaperId = payload;
        },
        setDataCiteDoi: (state, { payload }) => {
            state.dataCiteDoi = payload;
        },
        setPaperObservatory: (state, { payload }) => {
            state.paper.observatories = [payload.observatory_id];
            state.paper.organizations = [payload.organization_id];
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
        setContributionExtractionMethod: (state, { payload: { id, extractionMethod } }) => {
            state.contributions[state.contributions.map((c) => c.id).indexOf(id)].extraction_method = extractionMethod;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LOCATION_CHANGE, (state, { payload }) => {
            const matchPaper = match(ROUTES.VIEW_PAPER);
            const matchPaperContribution = match(ROUTES.VIEW_PAPER_CONTRIBUTION);
            const parsedPayload = matchPaper(payload.location.pathname);
            const parsedPayload2 = matchPaperContribution(payload.location.pathname);
            if (
                (parsedPayload && parsedPayload.params?.resourceId === state.paper.id) ||
                (parsedPayload2 && parsedPayload2.params?.resourceId === state.paper.id)
            ) {
                // when it's the same paper, do not init
                return state;
            }
            return initialState;
        });
    },
});

export const {
    loadPaper,
    setIsAddingContribution,
    setIsDeletingContribution,
    setIsSavingContribution,
    setPaperContributions,
    updatePaperContributionLabel,
    setPaperAuthors,
    setPaperObservatory,
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
    setContributionExtractionMethod,
    setVersion,
    setOriginalPaperId,
    setDataCiteDoi,
} = viewPaperSlice.actions;

export default viewPaperSlice.reducer;

/**
 * Get paper link
 * @param {Object[]} viewPaper view paper redux state
 * @return {String=} the paper link
 */
export const getPaperLink = (state) => {
    if (state.viewPaper.paper.publication_info?.url) {
        return state.viewPaper.paper.publication_info?.url;
    }
    if (state.viewPaper.paper.identifiers?.doi?.[0] && state.viewPaper.paper.identifiers?.doi?.[0].startsWith('10.')) {
        return `https://doi.org/${state.viewPaper.identifiers?.doi?.[0]}`;
    }
    return '';
};
