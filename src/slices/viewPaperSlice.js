import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import { MISC } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { match } from 'path-to-regexp';
import {
    clearResourceHistory,
    createContributionObject,
    createResourceAction as createResource,
    fetchStatementsForResource,
    loadContributionHistory,
    selectResourceAction as selectResource,
} from 'slices/statementBrowserSlice';
import { asyncLocalStorage, guid } from 'utils';

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
    selectedContributionId: '',
    abstract: '',
    isAbstractFetched: false,
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
            state.observatory_id = [payload.observatory_id];
            state.organization_id = [payload.organization_id];
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
        setIsAbstractFetched: (state, { payload }) => {
            state.isAbstractFetched = payload;
        },
        setFetchAbstractTitle: (state, { payload }) => {
            state.fetchAbstractTitle = payload;
        },
        setSelectedContributionId: (state, { payload }) => {
            state.selectedContributionId = payload;
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
            const id = guid();
            state.ranges[id] = {
                id,
                ...payload,
            };
        },
        removeAnnotation: (state, { payload }) => {
            delete state.ranges[payload.id];
        },
        toggleEditAnnotation: (state, { payload }) => {
            state.ranges[payload].isEditing = !state.ranges[payload].isEditing;
        },
        validateAnnotation: (state, { payload }) => {
            state.ranges[payload].certainty = 1;
        },
        updateAnnotationClass: (state, { payload }) => {
            state.ranges[payload.range.id].class = {
                id: payload.selectedOption.id,
                label: payload.selectedOption.label,
            };
            state.ranges[payload.range.id].certainty = 1;
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
    setPaperAuthors,
    setPaperObservatory,
    loadComparisonFromLocalStorage,
    addToComparison,
    removeFromComparison,
    setAbstract,
    setIsAbstractFetched,
    setFetchAbstractTitle,
    setSelectedContributionId,
    setNerResources,
    setNerProperties,
    setNerRawResponse,
    setPredicatesRawResponse,
    setBioassayText,
    setBioassayRawResponse,
    createAnnotation,
    removeAnnotation,
    toggleEditAnnotation,
    validateAnnotation,
    updateAnnotationClass,
    clearAnnotations,
    setAbstractDialogView,
    setContributionExtractionMethod,
    setVersion,
    setOriginalPaperId,
    setDataCiteDoi,
} = viewPaperSlice.actions;

export default viewPaperSlice.reducer;

export const selectContribution =
    ({ contributionId: id, contributionLabel }) =>
    (dispatch, getState) => {
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
