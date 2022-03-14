import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'connected-react-router';
import { ENTITIES } from 'constants/graphSettings';
import { match } from 'path-to-regexp';
import { last } from 'lodash';
import ROUTES from 'constants/routes';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

const getPreferenceFromCookies = p => {
    const cookieName = `preferences.${p}`;
    return cookies.get(cookieName) ? cookies.get(cookieName) === 'true' : undefined;
};

const initialState = {
    selectedResource: '',
    selectedProperty: '',
    level: 0,
    isFetchingStatements: false,
    openExistingResourcesInDialog: false,
    propertiesAsLinks: false, // if false the link appears in black font color and opens in a new window
    resourcesAsLinks: false,
    isTemplatesModalOpen: false,
    isHelpModalOpen: false,
    helpCenterArticleId: null,
    initOnLocationChange: true,
    keyToKeepStateOnLocationChange: null,
    isPreferencesOpen: false,
    preferences: {
        showClasses: getPreferenceFromCookies('showClasses') ?? false,
        showStatementInfo: getPreferenceFromCookies('showStatementInfo') ?? true,
        showValueInfo: getPreferenceFromCookies('showValueInfo') ?? true,
        showLiteralDataTypes: getPreferenceFromCookies('showLiteralDataTypes') ?? true
    },
    resources: {
        byId: {},
        allIds: []
    },
    properties: {
        byId: {},
        allIds: []
    },
    values: {
        byId: {},
        allIds: []
    },
    resourceHistory: {
        byId: {},
        allIds: []
    },
    templates: {},
    classes: {},
    // adding contribution object plus selected contributionId;
    contributions: {},
    selectedContributionId: ''
};

export const statementBrowserSlice = createSlice({
    name: 'statementBrowser',
    initialState,
    reducers: {
        setIsHelpModalOpen: (state, { isOpen, articleId }) => {
            state.isHelpModalOpen = isOpen;
            state.helpCenterArticleId = articleId;
        },
        setIsTemplateModalOpen: (state, { isOpen }) => {
            state.isTemplatesModalOpen = isOpen;
        },
        setIsPreferencesOpen: (state, { payload }) => {
            state.isPreferencesOpen = payload;
        },
        updatePreferences: (state, { payload }) => {
            state.preferences = {
                showClasses: typeof payload.showClasses === 'boolean' ? payload.showClasses : state.preferences.showClasses,
                showStatementInfo: typeof payload.showStatementInfo === 'boolean' ? payload.showStatementInfo : state.preferences.showStatementInfo,
                showValueInfo: typeof payload.showValueInfo === 'boolean' ? payload.showValueInfo : state.preferences.showValueInfo,
                showLiteralDataTypes:
                    typeof payload.showLiteralDataTypes === 'boolean' ? payload.showLiteralDataTypes : state.preferences.showLiteralDataTypes
            };
        },
        /**
         * Create Resource
         *
         * @param {Object} data - Resource Object
         * @param {String=} data.resourceId - Resource ID
         * @param {String=} data.existingResourceId - Existing resource ID
         * @param {String} data.label - Resource label
         * @param {Number} data.shared - Indicator number of incoming links to this resource
         * @param {Array} data.classes - Classes of the resource
         */
        createResource: (state, { payload }) => {
            state.resources.byId[payload.resourceId] = {
                label: payload.label ? payload.label : '',
                existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                shared: payload.shared ? payload.shared : 1,
                propertyIds: [],
                classes: payload.classes ? payload.classes : [],
                _class: payload._class ? payload._class : ENTITIES.RESOURCE
            };
            state.resources.allIds.push(payload.resourceId);
        },
        createProperty: (state, { payload }) => {
            if (state.resources.byId[payload.resourceId]) {
                if (!state.properties.byId[payload.propertyId].propertyIds) {
                    state.resources.byId[payload.resourceId].propertyIds = [];
                }
                state.resources.byId[payload.resourceId].propertyIds.push(payload.propertyId);
                state.properties.byId[payload.propertyId] = {
                    ...payload,
                    existingPredicateId: payload.existingPredicateId ? payload.existingPredicateId : null,
                    valueIds: [],
                    isExistingProperty: payload.isExistingProperty ? payload.isExistingProperty : false,
                    isEditing: false,
                    isSaving: false,
                    isAnimated: payload.isAnimated !== undefined ? payload.isAnimated : false
                };
                state.properties.allIds.push(payload.propertyId);
            }
            if (payload.createAndSelect) {
                state.selectedProperty = payload.propertyId;
            }
        },
        deleteProperty: (state, { payload }) => {
            delete state.properties.byId[payload.id];
            const propertyIndex = state.properties.allIds.indexOf(payload.id);
            delete state.properties.allIds[propertyIndex];
            const resourceIndex = state.resources.byId[payload.resourceId].propertyIds.indexOf(payload.id);
            delete state.resources.byId[payload.resourceId].propertyIds[resourceIndex];
            // TODO: maybe also delete related values, so it becomes easier to make the API call later?
        },
        updatePropertyLabel: (state, { payload }) => {
            state.properties.byId[payload.propertyId].label = payload.label;
        },
        changeProperty: (state, { payload }) => {
            state.properties.byId[payload.propertyId].label = payload.newProperty.label;
            state.properties.byId[payload.propertyId].existingPredicateId = payload.newProperty.isExistingProperty ? payload.newProperty.id : false;
            state.properties.byId[payload.propertyId].isExistingProperty = payload.newProperty.isExistingProperty;
        },
        toggleEditPropertyLabel: (state, { payload }) => {
            state.properties.byId[payload.id].isEditing = !state.properties.byId[payload.id].isEditing;
        },
        setIsSavingProperty: (state, { id, status }) => {
            state.properties.byId[id].isSaving = status;
        },
        setIsDeletingProperty: (state, { id, status }) => {
            state.properties.byId[id].isDeleting = status;
        },
        setDoneAnimation: (state, { payload }) => {
            state.properties.byId[payload.id].isAnimated = true;
        },
        createValue: (state, { payload }) => {
            if (state.properties.byId[payload.propertyId]) {
                state.properties.byId[payload.propertyId].valueIds.push(payload.valueId);
                state.values.byId[payload.valueId] = {
                    ...payload,
                    resourceId: payload.resourceId ? payload.resourceId : null,
                    isExistingValue: payload.isExistingValue ? payload.isExistingValue : false,
                    existingStatement: payload.existingStatement ? payload.existingStatement : false,
                    statementId: payload.statementId,
                    isEditing: false,
                    isSaving: false,
                    shared: payload.shared ? payload.shared : 1
                };
                state.values.allIds.push(payload.valueId);
                // TODO: is the same as creating a resource in the contributions, so make a function
                // add a new resource when a object value is created
                //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
                if (payload.__class !== ENTITIES.LITERAL && !state.resources.byId[payload.resourceId]) {
                    state.resources.allIds.push(payload.resourceId);
                    state.resources.byId[payload.resourceId] = {
                        ...payload,
                        existingResourceId: payload.existingResourceId && payload.isExistingValue ? payload.existingResourceId : null,
                        propertyIds: []
                    };
                }
            }
        },
        deleteValue: (state, { payload }) => {
            delete state.values.byId[payload.id];
            const valueIndex = state.values.allIds.indexOf(payload.id);
            delete state.values.allIds[valueIndex];
            const propertyIndex = state.properties.byId[payload.propertyId].valueIds.indexOf(payload.id);
            delete state.properties.byId[payload.propertyId].valueIds[propertyIndex];
        },
        setSavingValue: (state, { id, status }) => {
            state.values.byId[id].isSaving = status;
        },
        setIsAddingValue: (state, { id, status }) => {
            state.values.byId[id].isAddingValue = status;
        },
        setIsDeletingValue: (state, { id, status }) => {
            state.values.byId[id].isDeleting = status;
        },
        toggleEditValue: (state, { payload }) => {
            state.values.byId[payload.id].isEditing = !state.values.byId[payload.id].isEditing;
        },
        updateResourceClasses: (state, { payload }) => {
            state.resources.byId[payload.resourceId].classes = payload.classes;
            if (state.resources.byId[payload.resourceId].valueId) {
                state.values.byId[state.resources.byId[payload.resourceId].valueId].classes = payload.classes;
            }
        },
        updateResourceShared: (state, { resourceId, shared }) => {
            state.resources.byId[resourceId].classes = shared;
            if (state.resources.byId[resourceId].valueId) {
                state.values.byId[state.resources.byId[resourceId].valueId].classes = shared;
            }
        },
        updateValueLabel: (state, { payload }) => {
            state.values.byId[payload.valueId].label = payload.label;
            if (payload.datatype) {
                state.values.byId[payload.valueId].datatype = payload.datatype;
            }
            // Update all the labels of the same resource ID
            const resourceId = state.values.byId[payload.valueId].resourceId;
            if (resourceId) {
                state.resources.byId[resourceId].label = payload.label;
                for (const valueId of state.values.allIds) {
                    if (state.values.byId[valueId].resourceId === resourceId && valueId !== payload.valueId) {
                        state.values.byId[valueId].label = payload.label;
                    }
                }
                // Update the label in resource history
                state.resourceHistory.byId[resourceId].label = payload.label;
            }
        },
        selectResource: (state, { payload }) => {
            const level = payload.increaseLevel ? state.level + 1 : state.level - 1;

            state.selectedResource = payload.resourceId;
            state.level = level > 0 ? level : 0;

            if (!state.initOnLocationChange && state.contributions[state.selectedContributionId]) {
                // this wants to update the contribution object
                if (payload.resourceId === state.selectedContributionId) {
                    if (state.contributions[state.selectedContributionId].selectedResource === '') {
                        // there is no selected data yet;
                        state.contributions[state.selectedContributionId].selectedResource = payload.resourceId;
                        state.contributions[state.selectedContributionId].level = level > 0 ? level : 0;
                    }
                } else {
                    // check if this resource exists in the contribution data ;
                    const isContributionResource = !!state.contributions[payload.resourceId];
                    if (!isContributionResource) {
                        state.contributions[state.selectedContributionId].selectedResource = payload.resourceId;
                        state.contributions[state.selectedContributionId].level = level > 0 ? level : 0;
                    }
                }
            }
        },
        resetLevel: state => {
            state.level = 0;
        },
        addResourceHistory: (state, { payload }) => {
            const resourceId = payload.resourceId ? payload.resourceId : null; //state.contributions.byId[state.selectedContribution].resourceId
            const lastResourceId = state.resourceHistory.allIds[state.resourceHistory.allIds.length - 1];
            state.resourceHistory.byId[resourceId] = { id: resourceId, label: payload.label, propertyLabel: payload.propertyLabel };
            if (lastResourceId) {
                state.resourceHistory.byId[lastResourceId] = {
                    ...state.resourceHistory.byId[lastResourceId],
                    selectedProperty: state.selectedProperty
                };
            }
            state.resourceHistory.allIds.push(resourceId);
            // overwrite contribution history if needed
            if (!state.initOnLocationChange && state.contributions[state.selectedContributionId]) {
                const isContributionResource = !!state.contributions[resourceId];

                if (!isContributionResource) {
                    state.contributions[state.selectedContributionId].resourceHistory = state.resourceHistory;
                } else {
                    if (state.contributions[state.selectedContributionId].resourceHistory.allIds.length === 0) {
                        // will ignore history updates if there is already some data;
                        state.contributions[state.selectedContributionId].resourceHistory = state.resourceHistory;
                    }
                }
            }
        },
        setResourceHistory: (state, { payload }) => {
            const lastResourceId = last(state.resourceHistory.allIds);
            if (lastResourceId) {
                state.resourceHistory.byId[lastResourceId] = {
                    ...state.resourceHistory.byId[lastResourceId],
                    propertyLabel: last(payload.filter(pt => pt._class === ENTITIES.PREDICATE))?.label
                };
            }
            state.resourceHistory.allIds.unshift(...payload.filter(pt => pt._class !== ENTITIES.PREDICATE).map(pt => pt.id));
            payload.map((pt, index) => {
                if (pt._class !== ENTITIES.PREDICATE) {
                    state.resourceHistory.byId[pt.id] = {
                        id: pt.id,
                        label: pt.label,
                        propertyLabel: payload[index - 1]?.label
                    };
                }
                return null;
            });
            state.level = payload.length - 1;
        },
        gotoResourceHistory: (state, { payload }) => {
            const ids = state.resourceHistory.allIds.slice(0, payload.historyIndex + 1); //TODO: it looks like historyIndex can be derived, so remove it from payload
            if (!state.initOnLocationChange && state.contributions[state.selectedContributionId]) {
                state.contributions[state.selectedContributionId].resourceHistory.byId = state.resourceHistory.byId; // TODO: remove the history item from byId object (not really necessary, but it is cleaner)
                state.contributions[state.selectedContributionId].resourceHistory.allIds = ids;
                state.contributions.level = payload.historyIndex;
                state.contributions[state.selectedContributionId].selectedResource = payload.id;
                state.contributions[state.selectedContributionId].selectedProperty = state.resourceHistory.byId[payload.id].selectedProperty;
            }
            state.level = payload.historyIndex;
            state.selectedResource = payload.id;
            state.selectedProperty = state.resourceHistory.byId[payload.id].selectedProperty;
            state.resourceHistory = {
                allIds: ids,
                byId: {
                    ...state.resourceHistory.byId // TODO: remove the history item from byId object (not really necessary, but it is cleaner)
                }
            };
        },
        updateSettings: (state, { payload }) => {
            state.openExistingResourcesInDialog =
                typeof payload.openExistingResourcesInDialog === 'boolean'
                    ? payload.openExistingResourcesInDialog
                    : state.openExistingResourcesInDialog;
            state.propertiesAsLinks = typeof payload.propertiesAsLinks === 'boolean' ? payload.propertiesAsLinks : state.propertiesAsLinks;
            state.resourcesAsLinks = typeof payload.resourcesAsLinks === 'boolean' ? payload.resourcesAsLinks : state.resourcesAsLinks;
            state.initOnLocationChange =
                typeof payload.initOnLocationChange === 'boolean' ? payload.initOnLocationChange : state.initOnLocationChange;
            state.keyToKeepStateOnLocationChange = payload.keyToKeepStateOnLocationChange ? payload.keyToKeepStateOnLocationChange : null;
        },
        clearResourceHistory: state => {
            state.level = 0;
            state.resourceHistory = {
                allIds: [],
                byId: {}
            };
        },
        loadData: (state, { payload }) => {
            return { ...payload };
        },
        setStatementIsFetched: (state, { resourceId, depth }) => {
            state.resources.byId[resourceId].isFetched = true;
            state.resources.byId[resourceId].fetchedDepth = depth;
            state.resources.byId[resourceId].isFetching = false;
        },
        setStatementIsFetching: (state, { resourceId }) => {
            state.isFetchingStatements = true;
            if (resourceId) {
                state.resources.byId[resourceId].isFetching = true;
                state.resources.byId[resourceId].isFetched = false;
            }
        },
        setFailedFetchingStatements: (state, { resourceId }) => {
            state.isFetchingStatements = false;
            if (resourceId) {
                state.resources.byId[resourceId].isFetching = false;
                state.resources.byId[resourceId].isFailedFetching = true;
            }
        },
        updateContributionLabel: (state, { id, label }) => {
            state.resources.byId[id].label = label;
            state.resourceHistory.byId[id].label = label;
        },
        doneFetchingStatements: (state, { resourceId }) => {
            state.isFetchingStatements = false;
        },
        resetStatementBrowser: state => {
            return {
                ...initialState,
                preferences: {
                    showClasses: getPreferenceFromCookies('showClasses') ?? false,
                    showStatementInfo: getPreferenceFromCookies('showStatementInfo') ?? true,
                    showValueInfo: getPreferenceFromCookies('showValueInfo') ?? true,
                    showLiteralDataTypes: getPreferenceFromCookies('showLiteralDataTypes') ?? false
                }
            };
        },
        /** -- Handling for creation of contribution objects**/
        createContributionObject: (state, { payload }) => {
            state.selectedContributionId = payload.id;
            if (!state.contributions.hasOwnProperty(payload.id)) {
                const initData = {
                    selectedResource: '',
                    selectedProperty: '',
                    isFetchingStatements: false,
                    level: 0,
                    resourceHistory: {
                        byId: {},
                        allIds: []
                    }
                };
                state.contributions[payload.id] = initData;
            }
        },
        loadContributionHistory: (state, { payload }) => {
            const contribObj = state.contributions[payload.id];
            if (contribObj) {
                state.selectedResource = contribObj.selectedResource;
                state.selectedProperty = contribObj.selectedProperty;
                state.isFetchingStatements = contribObj.isFetchingStatements;
                state.level = contribObj.level;
                state.resourceHistory = contribObj.resourceHistory;
            }
        },
        // templateEngine
        createTemplate: (state, { payload }) => {
            state.templates[payload.id] = payload;
            if (state.classes[payload.class.id]?.templateIds) {
                state.classes[payload.class.id]?.templateIds.push(payload.id);
            } else {
                state.classes[payload.class.id] = { ...payload.class, templateIds: [payload.id] };
            }
        },
        setIsFetchingTemplatesOfClass: (state, { classID, status }) => {
            state.classes[classID].isFetching = status;
            if (status) {
                state.classes[classID].templateIds = [];
            }
        },
        setIsFetchingTemplateData: (state, { templateID, status }) => {
            state.templates[templateID].isFetching = status;
        }
    },
    extraReducers: {
        [LOCATION_CHANGE]: (state, { payload }) => {
            //from connected-react-router, reset the wizard when the page is changed
            const matchViewPaper = match(ROUTES.VIEW_PAPER);
            const contributionChange = matchViewPaper(payload.location.pathname);

            if (!state.initOnLocationChange && state.keyToKeepStateOnLocationChange === contributionChange?.params?.resourceId) {
                return {
                    ...state,
                    // returns current state but resets some variables :
                    selectedResource: '',
                    selectedProperty: '',
                    level: 0,
                    isFetchingStatements: false,
                    resourceHistory: {
                        byId: {},
                        allIds: []
                    }
                };
            } else {
                return {
                    ...initialState,
                    preferences: {
                        showClasses: getPreferenceFromCookies('showClasses') ?? false,
                        showStatementInfo: getPreferenceFromCookies('showStatementInfo') ?? true,
                        showValueInfo: getPreferenceFromCookies('showValueInfo') ?? true,
                        showLiteralDataTypes: getPreferenceFromCookies('showLiteralDataTypes') ?? false
                    }
                };
            }
        }
    }
});

export const { updateLabel } = statementBrowserSlice.actions;

export default statementBrowserSlice.reducer;
