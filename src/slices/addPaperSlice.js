import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE, guid } from 'utils';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';
import { mergeWith, isArray, uniqBy, merge } from 'lodash';
import { saveFullPaper } from 'services/backend/papers';
import { toast } from 'react-toastify';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import {
    createResourceAction as createResource,
    selectResourceAction as selectResource,
    loadStatementBrowserData,
    fetchTemplatesOfClassIfNeeded,
    updateContributionLabel as updateContributionLabelInSB,
    clearResourceHistory,
    fillStatements,
} from 'slices/statementBrowserSlice';

const initialState = {
    isTourOpen: false,
    showAbstractDialog: false,
    abstractDialogView: 'annotator', // annotator | input | list
    currentStep: 1,
    shouldBlockNavigation: false,
    tourStartAt: 0,
    title: '',
    authors: [],
    abstract: '',
    publicationMonth: '',
    publicationYear: '',
    entry: '',
    showLookupTable: false,
    doi: '',
    publishedIn: '',
    researchFields: [],
    selectedResearchField: '',
    selectedContribution: '',
    paperNewResourceId: null,
    url: '',
    ranges: {},
    contributions: {
        byId: {},
        allIds: [],
    },
    nerResources: [],
    nerProperties: [],
};

export const addPaperSlice = createSlice({
    name: 'addPaper',
    initialState,
    reducers: {
        updateGeneralData: (state, { payload }) => ({
            ...state,
            ...payload,
        }),
        nextStep: state => {
            state.currentStep += 1;
        },
        previousStep: state => {
            state.currentStep -= 1;
        },
        blockNavigation: (state, { payload: { status } }) => {
            state.shouldBlockNavigation = status;
        },
        loadPaperData: (state, { payload }) => ({
            ...payload,
        }),
        closeTour: state => {
            const cookies = new Cookies();
            if (cookies.get('takeTourClosed')) {
                state.isTourOpen = false;
            } else {
                cookies.set('takeTourClosed', true, { path: env('PUBLIC_URL'), maxAge: 604800 });
                state.isTourOpen = false;
            }
        },
        openTour: (state, { payload }) => {
            state.isTourOpen = true;
            state.tourStartAt = payload?.step ? payload.step : 0;
        },
        updateResearchField: (state, { payload }) => {
            state.researchFields = typeof payload.researchFields !== 'undefined' ? payload.researchFields : state.researchFields;
            state.selectedResearchField =
                typeof payload.selectedResearchField !== 'undefined' ? payload.selectedResearchField : state.selectedResearchField;
            if (payload.submit) {
                state.currentStep += 1;
            }
        },
        updateAbstract: (state, { payload }) => {
            state.abstract = payload;
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
        clearAnnotations: state => {
            state.ranges = {};
        },
        createContribution: (state, { payload }) => {
            const contribution = {
                contributions: {
                    byId: {
                        [payload.id]: {
                            id: payload.id,
                            label: payload.label,
                            resourceId: payload.resourceId,
                        },
                    },
                    allIds: [...state.contributions.allIds, payload.id],
                },
            };
            let selectedContribution = {};
            // if this is the first contribution, select it
            if (state.contributions.allIds.length === 0) {
                selectedContribution = {
                    selectedContribution: payload.id,
                    // selectedResource: payload.resourceId, //also set the selected resource id
                };
            }
            return merge({}, state, contribution, selectedContribution);
        },
        toggleAbstractDialog: state => {
            state.showAbstractDialog = !state.showAbstractDialog;
        },
        setAbstractDialogView: (state, { payload }) => {
            state.abstractDialogView = payload;
        },
        deleteContribution: (state, { payload }) => {
            // let newState = { ...state };

            // delete both from byId and allIds
            // TODO: states are immutable, so replace this code by building a new state object
            // newState.contributions.byId = omit(newState.contributions.byId, payload.id);
            // newState.contributions.allIds = newState.contributions.allIds.filter((val) => val !== payload.id);

            const contribution = {
                contributions: {
                    byId: Object.assign(
                        {},
                        ...Object.keys(state.contributions.byId)
                            .filter(contributionId => contributionId !== payload)
                            .map(k => ({ [k]: state.contributions.byId[k] })),
                    ),
                    allIds: [...state.contributions.allIds.filter(contributionId => contributionId !== payload)],
                },
            };

            return {
                ...state,
                ...contribution,
                selectedContribution: state.contributions.allIds[0], // select the first contribution
            };
        },
        selectContribution: (state, { payload }) => {
            let contributionId;
            if (!payload) {
                // if no id is provided, select the first contribution (happens in case of contribution deletion)
                if (state.contributions.allIds.length === 0) {
                    // if there are not contributions, dont select one
                    return state;
                }
                contributionId = state.contributions.allIds[0];
            } else {
                contributionId = payload;
            }
            state.selectedContribution = contributionId;
            state.level = 0;
        },
        updateContributionLabel: (state, { payload }) => {
            state.contributions.byId[payload.contributionId].label = payload.label;
        },
        saveAddPaper: (state, { payload }) => {
            state.paperNewResourceId = payload;
        },
        setNerResources: (state, { payload }) => {
            state.nerResources = payload;
        },
        setNerProperties: (state, { payload }) => {
            state.nerProperties = payload;
        },
    },
    extraReducers: {
        [LOCATION_CHANGE]: () => initialState,
    },
});

export const {
    updateGeneralData,
    nextStep,
    previousStep,
    blockNavigation,
    loadPaperData,
    closeTour,
    openTour,
    updateResearchField,
    updateAbstract,
    createAnnotation,
    removeAnnotation,
    toggleEditAnnotation,
    validateAnnotation,
    updateAnnotationClass,
    clearAnnotations,
    createContribution,
    toggleAbstractDialog,
    setAbstractDialogView,
    deleteContribution,
    selectContribution,
    updateContributionLabel,
    saveAddPaper,
    setNerResources,
    setNerProperties,
} = addPaperSlice.actions;

export default addPaperSlice.reducer;

export const loadPaperDataAction = data => dispatch => {
    dispatch(loadPaperData(data.addPaper));

    dispatch(loadStatementBrowserData(data.statementBrowser));
};

export const createContributionAction = ({ selectAfterCreation = false, fillStatements: performPrefill = false, statements = null }) => (
    dispatch,
    getState,
) => {
    const newResourceId = guid();
    const newContributionId = guid();
    const newContributionLabel = `Contribution ${getState().addPaper.contributions.allIds.length + 1}`;

    dispatch(
        createContribution({
            id: newContributionId,
            resourceId: newResourceId,
            label: newContributionLabel,
        }),
    );

    dispatch(
        createResource({
            resourceId: newResourceId,
            label: newContributionLabel,
            classes: [CLASSES.CONTRIBUTION],
        }),
    );

    if (selectAfterCreation) {
        dispatch(
            selectResource({
                increaseLevel: false,
                resourceId: newResourceId,
                label: newContributionLabel,
            }),
        );
    }

    // Dispatch loading template of classes
    dispatch(fetchTemplatesOfClassIfNeeded(CLASSES.CONTRIBUTION));

    if (performPrefill && statements) {
        dispatch(
            fillStatements({
                statements,
                resourceId: newResourceId,
            }),
        );
    }
};

export const deleteContributionAction = data => dispatch => {
    dispatch(deleteContribution(data.id));
    dispatch(selectContribution(data.selectAfterDeletion?.id));
};

export const selectContributionAction = data => dispatch => {
    dispatch(selectContribution(data.id));

    dispatch(clearResourceHistory());

    dispatch(
        selectResource({
            increaseLevel: false,
            resourceId: data.resourceId,
            label: data.label,
            resetLevel: true,
        }),
    );
};

export const updateContributionLabelAction = data => dispatch => {
    dispatch(updateContributionLabel(data));

    dispatch(updateContributionLabelInSB({ id: data.resourceId, label: data.label }));
};

// The function to customize merging objects (to handle using the same existing predicate twice in the same resource)
function customizer(objValue, srcValue) {
    if (isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

export const getResourceObject = (data, resourceId, newProperties) => {
    // Make a list of new resources ids
    const newResources = data.values.allIds
        .filter(valueId => !data.values.byId[valueId].isExistingValue)
        .map(valueId => data.values.byId[valueId].resourceId);
    return mergeWith(
        {},
        ...data.resources.byId[resourceId].propertyIds.map(propertyId => {
            const property = data.properties.byId[propertyId];
            return {
                // Map properties of resource
                /* Use the temp id from unique list of new properties */
                [property.existingPredicateId
                    ? property.existingPredicateId
                    : newProperties.find(p => p[property.label])[property.label]]: property.valueIds.map(valueId => {
                    const value = data.values.byId[valueId];
                    if (value._class === ENTITIES.LITERAL && !value.isExistingValue) {
                        return {
                            text: value.label,
                            datatype: value.datatype,
                        };
                    }
                    if (!value.isExistingValue) {
                        const newResources = {};
                        newResources[value.resourceId] = value.resourceId;
                        return {
                            '@temp': `_${value.resourceId}`,
                            label: value.label,
                            classes: value.classes && value.classes.length > 0 ? value.classes : null,
                            values: { ...getResourceObject(data, value.resourceId, newProperties) },
                        };
                    }
                    return {
                        '@id': newResources.includes(value.resourceId) ? `_${value.resourceId}` : value.resourceId,
                    };
                }),
            };
        }),
        customizer,
    );
};

// Middleware function to transform frontend data to backend format
export const saveAddPaperAction = data => async dispatch => {
    // Get new properties (ensure that  no duplicate labels are in the new properties)
    let newProperties = data.properties.allIds.filter(propertyId => !data.properties.byId[propertyId].existingPredicateId);
    newProperties = newProperties.map(propertyId => ({ id: propertyId, label: data.properties.byId[propertyId].label }));
    newProperties = uniqBy(newProperties, 'label');
    newProperties = newProperties.map(property => ({ [property.label]: `_${property.id}` }));
    const paperObj = {
        // Set new predicates label and temp ID
        predicates: newProperties,
        // Set the paper metadata
        paper: {
            title: data.title,
            doi: data.doi,
            authors: data.authors.map(author => ({
                label: author.label,
                ...(author.label !== author.id ? { id: author.id } : {}),
                ...(author.orcid ? { orcid: author.orcid } : {}),
            })),
            publicationMonth: data.publicationMonth,
            publicationYear: data.publicationYear,
            publishedIn: data.publishedIn ? data.publishedIn : undefined,
            url: data.url,
            researchField: data.selectedResearchField,
            // Set the contributions data
            contributions: data.contributions.allIds.map(c => {
                const contribution = data.contributions.byId[c];
                return {
                    name: contribution.label,
                    classes:
                        data.resources.byId[contribution.resourceId].classes && data.resources.byId[contribution.resourceId].classes.length > 0
                            ? data.resources.byId[contribution.resourceId].classes
                            : null,
                    values: { ...getResourceObject(data, contribution.resourceId, newProperties) },
                };
            }),
        },
    };

    try {
        const paper = await saveFullPaper(paperObj);
        dispatch(saveAddPaper(paper.id));

        dispatch(blockNavigation({ status: false }));
    } catch (e) {
        console.log(e);
        toast.error('Something went wrong while saving this paper.');
        dispatch(previousStep());
    }
};
