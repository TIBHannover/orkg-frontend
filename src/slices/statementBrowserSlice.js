import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'utils';
import { ENTITIES, PREDICATES, CLASSES } from 'constants/graphSettings';
import { match } from 'path-to-regexp';
import { last, flatten, uniqBy } from 'lodash';
import ROUTES from 'constants/routes';
import { Cookies } from 'react-cookie';
import { guid, filterStatementsBySubjectId } from 'utils';
import { orderBy, uniq } from 'lodash';
import { getEntity } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import format from 'string-format';
import {
    getTemplateById,
    getTemplatesByClass,
    getStatementsBundleBySubject,
    createResourceStatement,
    createLiteralStatement
} from 'services/backend/statements';
import { createResource as createResourceApi, updateResourceClasses as updateResourceClassesApi } from 'services/backend/resources';
import DATA_TYPES from 'constants/DataTypes.js';
import { toast } from 'react-toastify';

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
        setIsHelpModalOpen: (state, { payload: { isOpen, articleId } }) => {
            state.isHelpModalOpen = isOpen;
            state.helpCenterArticleId = articleId;
        },
        setIsTemplateModalOpen: (state, { payload: { isOpen } }) => {
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
                if (!state.resources.byId[payload.resourceId].propertyIds) {
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
            state.properties.allIds.splice(propertyIndex, 1);
            const resourceIndex = state.resources.byId[payload.resourceId].propertyIds.indexOf(payload.id);
            state.resources.byId[payload.resourceId].propertyIds.splice(resourceIndex, 1);
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
        setIsSavingProperty: (state, { payload: { id, status } }) => {
            state.properties.byId[id].isSaving = status;
        },
        setIsDeletingProperty: (state, { payload: { id, status } }) => {
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
            state.values.allIds.splice(valueIndex, 1);
            const propertyIndex = state.properties.byId[payload.propertyId].valueIds.indexOf(payload.id);
            state.properties.byId[payload.propertyId].valueIds.splice(propertyIndex, 1);
        },
        setSavingValue: (state, { payload: { id, status } }) => {
            state.values.byId[id].isSaving = status;
        },
        setIsAddingValue: (state, { payload: { id, status } }) => {
            state.properties.byId[id].isAddingValue = status;
        },
        setIsDeletingValue: (state, { payload: { id, status } }) => {
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
        updateResourceShared: (state, { payload: { resourceId, shared } }) => {
            state.resources.byId[resourceId].shared = shared;
            if (state.resources.byId[resourceId].valueId) {
                state.values.byId[state.resources.byId[resourceId].valueId].shared = shared;
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
                if (state.resourceHistory.byId[resourceId]) {
                    state.resourceHistory.byId[resourceId].label = payload.label;
                }
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
        setIsFetchedStatements: (state, { payload: { resourceId, depth } }) => {
            state.resources.byId[resourceId].isFetched = true;
            state.resources.byId[resourceId].fetchedDepth = depth;
            state.resources.byId[resourceId].isFetching = false;
        },
        setIsFetchingStatements: (state, { payload: { resourceId } }) => {
            state.isFetchingStatements = true;
            if (resourceId) {
                state.resources.byId[resourceId].isFetching = true;
                state.resources.byId[resourceId].isFetched = false;
            }
        },
        setFailedFetchingStatements: (state, { payload: { resourceId } }) => {
            state.isFetchingStatements = false;
            if (resourceId) {
                state.resources.byId[resourceId].isFetching = false;
                state.resources.byId[resourceId].isFailedFetching = true;
            }
        },
        updateContributionLabel: (state, { payload: { id, label } }) => {
            state.resources.byId[id].label = label;
            state.resourceHistory.byId[id].label = label;
        },
        doneFetchingStatements: (state, { payload: { resourceId } }) => {
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
        setIsFetchingTemplatesOfClass: (state, { payload: { classID, status } }) => {
            if (!state.classes[classID]) {
                state.classes[classID] = {};
            }
            state.classes[classID].isFetching = status;
            if (status) {
                state.classes[classID].templateIds = [];
            }
        },
        setIsFetchingTemplateData: (state, { payload: { templateID, status } }) => {
            if (!state.templates[templateID]) {
                state.templates[templateID] = {};
            }
            state.templates[templateID].isFetching = status;
        }
    },
    extraReducers: {
        [LOCATION_CHANGE]: (state, { payload }) => {
            //from redux-first-history, reset the wizard when the page is changed
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

export const {
    setIsHelpModalOpen,
    setIsTemplateModalOpen,
    setIsPreferencesOpen,
    updatePreferences,
    createResource,
    createProperty,
    deleteProperty,
    updatePropertyLabel,
    changeProperty,
    toggleEditPropertyLabel,
    setIsSavingProperty,
    setIsDeletingProperty,
    setDoneAnimation,
    createValue,
    deleteValue,
    setSavingValue,
    setIsAddingValue,
    setIsDeletingValue,
    toggleEditValue,
    updateResourceClasses,
    updateResourceShared,
    updateValueLabel,
    selectResource,
    resetLevel,
    addResourceHistory,
    setResourceHistory,
    gotoResourceHistory,
    updateSettings,
    clearResourceHistory,
    loadData,
    setIsFetchedStatements,
    setIsFetchingStatements,
    setFailedFetchingStatements,
    updateContributionLabel,
    doneFetchingStatements,
    resetStatementBrowser,
    createContributionObject,
    loadContributionHistory,
    createTemplate,
    setIsFetchingTemplatesOfClass,
    setIsFetchingTemplateData
} = statementBrowserSlice.actions;

export default statementBrowserSlice.reducer;

export const setInitialPath = data => dispatch => {
    data?.length > 0 && dispatch(setResourceHistory(data));
};

/**
 * Initialize the statement browser without contribution
 * (e.g : new store to show resource in dialog)
 * @param {Object} data - Initial resource
 * @param {string} data.label - The label of the resource.
 * @param {string} data.resourceId - The resource id.
 */
export const initializeWithoutContribution = data => dispatch => {
    // To initialize:
    // 1. Create a resource (the one that is requested), so properties can be connected to this
    // 2. Select this resource (only a selected resource is shown)
    // 3. Fetch the statements related to this resource

    const label = data.label;
    const resourceId = data.resourceId;
    const rootNodeType = data.rootNodeType;
    let classes = [];
    if (rootNodeType === ENTITIES.PREDICATE) {
        classes = [CLASSES.PREDICATE];
    }
    if (rootNodeType === ENTITIES.CLASS) {
        classes = [CLASSES.CLASS];
    }

    dispatch(
        createResourceAction({
            label: label,
            existingResourceId: resourceId,
            resourceId: resourceId,
            classes: classes,
            _class: data.rootNodeType
        })
    );

    dispatch(
        selectResourceAction({
            increaseLevel: false,
            resourceId: resourceId,
            label: label
        })
    );

    dispatch(
        fetchStatementsForResource({
            existingResourceId: resourceId,
            resourceId: resourceId,
            rootNodeType: rootNodeType
        })
    );
};

/**
 * Initialize the statement browser with a resource then add the required properties
 *
 * @param {Object} data - Initial resource
 * @param {string} data.label - The label of the resource.
 * @param {string} data.resourceId - The resource id.
 * @return {Promise} Promise object of creating the required properties
 */
export function initializeWithResource(data) {
    return dispatch => {
        const label = data.label;
        const resourceId = data.resourceId;

        dispatch(clearResourceHistory());

        dispatch(
            selectResourceAction({
                increaseLevel: false,
                resourceId: resourceId,
                label: label
            })
        ).then(() => dispatch(createRequiredPropertiesInResource(resourceId)));
    };
}

/**
 * Get new properties that are not saved in the backend yet
 *
 * @param {Object} state - Current state of the Store
 * @return {Promise} List of new properties
 */
export function getNewPropertiesList(state) {
    const newPropertiesList = [];
    for (const key in state.statementBrowser.properties.byId) {
        const property = state.statementBrowser.properties.byId[key];
        if (!property.existingPredicateId) {
            newPropertiesList.push({
                id: null,
                label: property.label
            });
        }
    }
    //  ensure no properties with duplicate Labels exist
    return uniqBy(newPropertiesList, 'label');
}

/**
 * Get the list of existing predicate ids of a resource
 *
 * @param {Object} state - Current state of the Store
 * @param {String} resourceId - Resource ID
 * @return {Array} - list of existing predicates
 */
export function getExistingPredicatesByResource(state, resourceId) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }
    let propertyIds = resource.propertyIds;
    if (propertyIds) {
        propertyIds = resource.propertyIds ? resource.propertyIds : [];
        propertyIds = propertyIds.map(propertyId => {
            const property = state.statementBrowser.properties.byId[propertyId];
            return property.existingPredicateId;
        });
        return propertyIds.filter(p => p); // return a list without null values (predicates that aren't in the database)
    } else {
        return [];
    }
}

/**
 * Fill the statements of a resource
 * (e.g : new store to show resource in dialog)
 * @param {Object} statements - Statement
 * @param {Array} statements.properties - The properties
 * @param {Array} statements.values - The values
 * @param {string} resourceId - The target resource ID
 * @param {boolean} syncBackend - Sync the fill with the backend
 */
export const fillStatements = ({ statements, resourceId, syncBackend = false }) => async (dispatch, getState) => {
    // properties
    for (const property of statements.properties) {
        dispatch(
            createProperty({
                propertyId: property.propertyId ? property.propertyId : guid(),
                existingPredicateId: property.existingPredicateId,
                resourceId: resourceId,
                label: property.label,
                isAnimated: property.isAnimated !== undefined ? property.isAnimated : false,
                canDuplicate: property.canDuplicate ? true : false
            })
        );
    }

    // values
    for (const value of statements.values) {
        /**
         * The resource ID of the value
         * @type {string}
         */
        let newObject = null;
        /**
         * The statement of the value
         * @type {string}
         */
        let newStatement = null;
        /**
         * The value ID in the statement browser
         * @type {string}
         */
        const valueId = guid();

        if (syncBackend) {
            const predicate = getState().statementBrowser.properties.byId[value.propertyId];
            if (value.existingResourceId) {
                // The value exist in the database
                newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, value.existingResourceId);
            } else {
                // The value doesn't exist in the database
                switch (value._class) {
                    case ENTITIES.RESOURCE:
                        newObject = await createResourceApi(value.label, value.classes ? value.classes : []);
                        newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, newObject.id);
                        break;
                    case ENTITIES.PREDICATE:
                        newObject = await createPredicate(value.label);
                        newStatement = await createResourceStatement(resourceId, predicate.existingPredicateId, newObject.id);
                        break;
                    default:
                        newObject = await createLiteral(value.label, value.datatype);
                        newStatement = await createLiteralStatement(resourceId, predicate.existingPredicateId, newObject.id);
                }
            }
        }

        dispatch(
            createValueAction({
                valueId: value.valueId ? value.valueId : valueId,
                ...value,
                propertyId: value.propertyId,
                existingResourceId: syncBackend && newObject ? newObject.id : value.existingResourceId ? value.existingResourceId : null,
                isExistingValue: syncBackend ? true : value.isExistingValue ? value.isExistingValue : false,
                statementId: newStatement ? newStatement.id : null
            })
        );
    }

    return Promise.resolve();
};

/**
 * Get the list of property id of a resource by existing predicate id
 *
 * @param {Object} state - Current state of the Store
 * @param {String} resourceId - Resource ID
 * @param {String} existingPredicateId - existing predicate ID
 * @return {String} - property id
 */
export function getPropertyIdByByResourceAndPredicateId(state, resourceId, existingPredicateId) {
    if (!resourceId) {
        return null;
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return null;
    }

    const propertyIds = resource.propertyIds ?? [];
    let propertyId;
    if (propertyIds?.length > 0) {
        propertyId = propertyIds.find(propertyId => {
            const property = state.statementBrowser.properties.byId[propertyId];
            return property.existingPredicateId === existingPredicateId;
        });
        return propertyId ?? null; // return a list without null values (predicates that aren't in the database)
    } else {
        return null;
    }
}

/**
 * Remove properties with no values of resource based on the template of a class
 * (This should be called before removing the class from the source it self)
 * @param {String} resourceId Resource ID
 * @param {String} classId Class ID
 */
export function removeEmptyPropertiesOfClass({ resourceId, classId }) {
    return (dispatch, getState) => {
        const components = getComponentsByResourceID(getState(), resourceId, classId);
        const existingPropertyIdsToRemove = components.map(mp => mp.property?.id).filter(p => p);
        const resource = getState().statementBrowser.resources.byId[resourceId];
        if (!resource) {
            return [];
        }
        let propertyIds = resource.propertyIds;
        if (propertyIds) {
            propertyIds = resource.propertyIds ? resource.propertyIds : [];
            for (const propertyId of propertyIds) {
                const property = getState().statementBrowser.properties.byId[propertyId];
                if (existingPropertyIdsToRemove.includes(property.existingPredicateId) && property.valueIds?.length === 0) {
                    dispatch(
                        deleteProperty({
                            id: property.propertyId,
                            resourceId: resourceId
                        })
                    );
                }
            }
        } else {
            return [];
        }
    };
}

/**
 * Create required properties based on the used template
 *
 * @param {String} resourceId Resource ID
 * @return {{existingPredicateId: String, propertyId: String}[]} list of created properties
 */
export function createRequiredPropertiesInResource(resourceId) {
    return (dispatch, getState) => {
        const createdProperties = [];
        const components = getComponentsByResourceID(getState(), resourceId);
        const existingPropertyIds = getExistingPredicatesByResource(getState(), resourceId);

        // Add required properties (minOccurs >= 1)
        components
            .filter(x => !existingPropertyIds.includes(x.property.id))
            .map(mp => {
                if (mp.minOccurs >= 1) {
                    const propertyId = guid();
                    dispatch(
                        createProperty({
                            propertyId: propertyId,
                            resourceId: resourceId,
                            existingPredicateId: mp.property.id,
                            label: mp.property.label,
                            isExistingProperty: true,
                            isTemplate: false
                        })
                    );
                    createdProperties.push({
                        existingPredicateId: mp.property.id,
                        propertyId
                    });
                }
                return null;
            });

        return Promise.resolve(createdProperties);
    };
}

/**
 * Get research problems of contribution resource
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {String[]} list of template IDs
 */
export function getResearchProblemsOfContribution(state, resourceId) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }
    if (resource && resource.propertyIds) {
        const researchProblemProperty = resource.propertyIds.find(
            p => state.statementBrowser.properties.byId[p].existingPredicateId === PREDICATES.HAS_RESEARCH_PROBLEM
        );
        if (researchProblemProperty) {
            const resourcesId = state.statementBrowser.properties.byId[researchProblemProperty].valueIds
                .filter(v => state.statementBrowser.values.byId[v].isExistingValue)
                .map(v => state.statementBrowser.values.byId[v].resourceId);
            return uniq(resourcesId);
        }
    }
    return [];
}

/**
 * Get template IDs by resource ID
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {String[]} list of template IDs
 */
export function getTemplateIDsByResourceID(state, resourceId) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }
    let templateIds = [];
    if (resource.classes) {
        for (const c of resource.classes) {
            if (state.statementBrowser.classes[c]) {
                templateIds = templateIds.concat(state.statementBrowser.classes[c].templateIds);
            }
        }
    }
    templateIds = uniq(templateIds);
    return templateIds;
}

/**
 * Get components by resource ID
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {{
 * id: String,
 * minOccurs: Number,
 * maxOccurs: Number,
 * property: Object,
 * value: Object=,
 * validationRules: Array
 * }[]} list of components
 */
export function getComponentsByResourceID(state, resourceId, classId = null) {
    if (!resourceId) {
        return [];
    }
    const resource = state.statementBrowser.resources.byId[resourceId];
    if (!resource) {
        return [];
    }

    // 1 - Get all template ids of this resource
    const templateIds = getTemplateIDsByResourceID(state, resourceId);

    // 2 - Collect the components
    let components = [];
    for (const templateId of templateIds) {
        const template = state.statementBrowser.templates[templateId];
        if (template && template.components && (!classId || classId === template.class?.id)) {
            components = components.concat(template.components);
        }
    }
    return components;
}

/**
 * Get components by resource ID and PredicateID
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @param {String} predicateId Existing Predicate ID
 * @return {{
 * id: String,
 * minOccurs: Number,
 * maxOccurs: Number,
 * property: Object,
 * value: Object=,
 * validationRules: Array
 * }[]} list of components
 */
export function getComponentsByResourceIDAndPredicateID(state, resourceId, predicateId) {
    const resourceComponents = getComponentsByResourceID(state, resourceId);
    if (resourceComponents.length === 0) {
        return [];
    }
    return resourceComponents.filter(c => c.property.id === predicateId);
}

export const loadStatementBrowserData = data => dispatch => {
    dispatch(loadData(data));
};

/**
 * Create Property
 *
 * @param {Object} data - Property Object
 * @param {String} data.resourceId - Resource ID
 * @param {String=} data.propertyId - Property ID
 * @param {String=} data.existingPredicateId - Existing PredicateId ID
 * @param {Boolean} data.canDuplicate - Whether it's possible to duplicate the existing predicate
 */
export function createPropertyAction(data) {
    return (dispatch, getState) => {
        if (!data.canDuplicate && data.existingPredicateId) {
            const resource = getState().statementBrowser.resources.byId[data.resourceId];

            if (resource && resource.propertyIds) {
                const isExistingProperty = resource.propertyIds.find(p => {
                    if (getState().statementBrowser.properties.byId[p].existingPredicateId === data.existingPredicateId) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (isExistingProperty) {
                    // Property exists already
                    toast.info(`The property ${data.label} exists already`);
                    return null;
                }
            }
        }
        dispatch(
            createProperty({
                propertyId: data.propertyId ? data.propertyId : guid(),
                ...data
            })
        );
    };
}

/**
 * Can add property in resource
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {Boolean} Whether it's possible to add a property
 */
export function canAddProperty(state, resourceId) {
    // Get all template ids
    const templateIds = getTemplateIDsByResourceID(state, resourceId);

    // Check if one of the template is strict
    for (const templateId of templateIds) {
        const template = state.statementBrowser.templates[templateId];
        if (template && template.isStrict) {
            return false;
        }
    }
    return true;
}

/**
 * Can add value in property resource
 * (compare the number of values with maxOccurs)
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @param {String} propertyId Property ID
 * @return {Boolean} Whether it's possible to add a value
 */
export function canAddValue(state, resourceId, propertyId) {
    const property = state.statementBrowser.properties.byId[propertyId];
    if (property) {
        const typeComponents = getComponentsByResourceIDAndPredicateID(state, resourceId, property.existingPredicateId);
        if (typeComponents && typeComponents.length > 0) {
            if (typeComponents[0].maxOccurs && property.valueIds.length >= parseInt(typeComponents[0].maxOccurs)) {
                return false;
            } else {
                return true;
            }
        }
        return true;
    } else {
        return true;
    }
}

/**
 * Can delete property in resource
 * (check if minOccurs>=1)
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @param {String} propertyId Property ID
 * @return {Boolean} Whether it's possible to delete the property
 */
export function canDeleteProperty(state, resourceId, propertyId) {
    const property = state.statementBrowser.properties.byId[propertyId];
    if (property) {
        const typeComponents = getComponentsByResourceIDAndPredicateID(state, resourceId, property.existingPredicateId);
        if (typeComponents && typeComponents.length > 0) {
            if (typeComponents[0].minOccurs >= 1) {
                return false;
            } else {
                return true;
            }
        }
        return true;
    } else {
        return true;
    }
}

/**
 * Get suggested properties
 *
 * @param {Object} state Current state of the Store
 * @param {String} resourceId Resource ID
 * @return {Object[]} list of suggested components
 */
export function getSuggestedProperties(state, resourceId) {
    const components = getComponentsByResourceID(state, resourceId);
    const existingPropertyIds = getExistingPredicatesByResource(state, resourceId);

    return components.filter(x => !existingPropertyIds.includes(x.property.id));
}

/**
 * Update resource classes
 *
 * @param {Object} data - Resource Object
 * @param {String=} data.resourceId - resource ID
 * @param {Array=} data.classes - Classes of value
 */
export const updateResourceClassesAction = ({ resourceId, classes, syncBackend = false }) => (dispatch, getState) => {
    const resource = getState().statementBrowser.resources.byId[resourceId];
    if (resource) {
        dispatch(updateResourceClasses({ resourceId, classes: uniq(classes?.filter(c => c) ?? []) }));
        // Fetch templates
        const templatesOfClassesLoading = classes && classes?.filter(c => c).map(classID => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
        // Add required properties
        Promise.all(templatesOfClassesLoading).then(() => dispatch(createRequiredPropertiesInResource(resourceId)));
        if (syncBackend) {
            return updateResourceClassesApi(resourceId, uniq(classes?.filter(c => c) ?? []));
        }
    }
    return Promise.resolve();
};

/**
 * Create Value then fetch templates
 *
 * @param {Object} data - Value Object
 * @param {String=} data.valueId - value ID
 * @param {String=} data.existingResourceId - Existing resource ID
 * @param {String=} data._class - The value type (resource|predicate|literal|class)
 * @param {Array=} data.classes - Classes of value
 */
export function createValueAction(data) {
    return dispatch => {
        const resourceId = data.existingResourceId ? data.existingResourceId : data._class === ENTITIES.RESOURCE ? guid() : null;

        dispatch(
            createValue({
                valueId: data.valueId ? data.valueId : guid(),
                resourceId: resourceId,
                ...data
            })
        );

        // Dispatch loading template of classes
        data.classes && data.classes.map(classID => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
        return Promise.resolve();
    };
}

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
export const createResourceAction = data => dispatch => {
    dispatch(
        createResource({
            resourceId: data.resourceId ? data.resourceId : guid(),
            label: data.label,
            existingResourceId: data.existingResourceId,
            shared: data.shared ? data.shared : 1,
            classes: data.classes ? data.classes : [],
            _class: data._class ? data._class : ENTITIES.RESOURCE
        })
    );
};

/**
 * Check if the template should be fetched
 *
 * @param {Object} state - Current state of the Store
 * @param {String} templateID - Template ID
 * @return {Boolean} if the template should be fetched or not
 */
function shouldFetchTemplate(state, templateID) {
    const template = state.statementBrowser.templates[templateID];
    if (!template) {
        return true;
    } else {
        return false;
    }
}

/**
 * Fetch template by ID
 *
 * @param {String} templateID - Template ID
 * @return {Promise} Promise object represents the template
 */
export function fetchTemplateIfNeeded(templateID) {
    return async (dispatch, getState) => {
        if (shouldFetchTemplate(getState(), templateID)) {
            dispatch(setIsFetchingTemplateData({ templateID, status: true }));
            const template = await getTemplateById(templateID);

            // Add template to the global state
            dispatch(createTemplate(template));
            dispatch(setIsFetchingTemplateData({ templateID, status: false }));
            return template;
        } else {
            // Let the calling code know there's nothing to wait for.
            const template = getState().statementBrowser.templates[templateID];
            return Promise.resolve(template);
        }
    };
}

/**
 * Check if the property has a template context
 *
 * @param {Object} state - Current state of the Store
 * @param {String} propertyId - Property ID
 */
export function isTemplateContextProperty(state, propertyId) {
    // template.predicate && template?.predicate.id !== PREDICATES.HAS_CONTRIBUTION;
    const property = state.statementBrowser.properties.byId[propertyId];
    if (property) {
        for (const valueId of property.valueIds) {
            const value = state.statementBrowser.values.byId[valueId];
            // Get all template ids
            const templateIds = getTemplateIDsByResourceID(state, value.resourceId);
            // Check if one of the template is strict
            for (const templateId of templateIds) {
                const template = state.statementBrowser.templates[templateId];

                if (template && template?.predicate?.id === property.existingPredicateId) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Fill a resource with a template
 *
 * @param {String} templateID - Template ID
 * @param {String} selectedResource - The resource to fill with the template
 * @param {Boolean} syncBackend - syncBackend
 * @return {Promise} Promise object
 */
export function fillResourceWithTemplate({ templateID, resourceId, syncBackend = false }) {
    return async (dispatch, getState) => {
        return dispatch(fetchTemplateIfNeeded(templateID)).then(async templateDate => {
            const template = templateDate;
            // Check if it's a template
            if (template && template?.components?.length > 0) {
                // TODO : handle the case where the template isFetching
                if (!template.predicate || template?.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                    // update the class of the current resource
                    dispatch(
                        updateResourceClasses({
                            resourceId,
                            classes: [...getState().statementBrowser.resources.byId[resourceId].classes, template.class.id],
                            syncBackend: syncBackend
                        })
                    );
                    // Add properties
                    const statements = { properties: [], values: [] };
                    for (const component of template?.components) {
                        statements['properties'].push({
                            existingPredicateId: component.property.id,
                            label: component.property.label
                        });
                    }
                    dispatch(fillStatements({ statements, resourceId, syncBackend }));
                } else if (template.predicate) {
                    // Add template to the statement browser
                    const statements = { properties: [], values: [] };
                    const pID = guid();
                    const vID = guid();
                    let instanceResourceId = guid();
                    statements['properties'].push({
                        propertyId: pID,
                        existingPredicateId: template.predicate.id,
                        label: template.predicate.label,
                        isAnimated: false,
                        canDuplicate: true
                    });
                    if (syncBackend) {
                        const newObject = await createResourceApi(template.label, template.class ? [template.class.id] : []);
                        instanceResourceId = newObject.id;
                    }
                    statements['values'].push({
                        valueId: vID,
                        label: template.label,
                        existingResourceId: instanceResourceId,
                        _class: ENTITIES.RESOURCE,
                        propertyId: pID,
                        classes: template.class ? [template.class.id] : []
                    });
                    await dispatch(fillStatements({ statements, resourceId: resourceId, syncBackend }));
                    // Add properties
                    const instanceStatements = { properties: [], values: [] };
                    for (const component of template?.components) {
                        instanceStatements['properties'].push({
                            existingPredicateId: component.property.id,
                            label: component.property.label
                        });
                    }
                    await dispatch(
                        fillStatements({
                            statements: instanceStatements,
                            resourceId: instanceResourceId,
                            syncBackend: syncBackend
                        })
                    );
                }
            }
            return Promise.resolve();
        });
    };
}

/**
 * Check if the class template should be fetched
 *
 * @param {Object} state - Current state of the Store
 * @param {String} classID - Class ID
 * @return {Boolean} if the class template should be fetched or not
 */
function shouldFetchTemplatesOfClass(state, classID) {
    const classObj = state.statementBrowser.classes[classID];
    if (!classObj) {
        return true;
    } else {
        return false;
    }
}

/**
 * Fetch templates of class
 *
 * @param {String} classID - Class ID
 */
export function fetchTemplatesOfClassIfNeeded(classID) {
    return async (dispatch, getState) => {
        if (shouldFetchTemplatesOfClass(getState(), classID)) {
            dispatch(setIsFetchingTemplatesOfClass({ classID, status: true }));
            const templateIds = await getTemplatesByClass(classID);
            dispatch(setIsFetchingTemplatesOfClass({ classID, status: false }));
            const templates = await Promise.all(templateIds.map(templateId => dispatch(fetchTemplateIfNeeded(templateId)))).catch(e => []);
            return templates;
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve();
        }
    };
}

/**
 * Select resource
 *
 * @param {Object} data
 * @param {Boolean} data.increaseLevel - Increase statement browser level
 * @param {String} data.resourceId - Resource ID
 * @param {String} data.label - Resource Label
 * @param {Boolean} data.resetLevel - Reset statement browser level
 * @return {Promise} Promise object of creating the required properties
 */
export function selectResourceAction(data) {
    return dispatch => {
        // use redux thunk for async action, for capturing the resource properties
        dispatch(
            selectResource({
                increaseLevel: data.increaseLevel,
                resourceId: data.resourceId,
                label: data.label
            })
        );

        dispatch(
            addResourceHistory({
                resourceId: data.resourceId,
                label: data.label,
                propertyLabel: data.propertyLabel
            })
        );

        if (data.resetLevel) {
            dispatch(resetLevel());
        }
        return Promise.resolve().then(() => dispatch(createRequiredPropertiesInResource(data.resourceId)));
    };
}

export const goToResourceHistory = data => (dispatch, getState) => {
    if (!getState().statementBrowser.resources.byId[data.id]) {
        dispatch(
            fetchStatementsForResource({
                resourceId: data.id
            })
        );
    }
    dispatch(gotoResourceHistory(data));
};

/**
 * Check if it should fetch statements for resources
 *
 * @param {Object} state - Current state of the Store
 * @param {String} resourceId - Resource ID
 * @param {Number} depth - The required depth
 * @return {Boolean} if the resource statements should be fetched or not
 */
function shouldFetchStatementsForResource(state, resourceId, depth, nodeType) {
    const resource = state.statementBrowser.resources.byId[resourceId];
    // We should not load if the node is a literal or it doesn't exist in the backend
    if (
        nodeType !== ENTITIES.LITERAL &&
        (!resource || (resource.existingResourceId && !resource.isFetched) || (resource.isFetched && resource.fetchedDepth < depth))
    ) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if it should add a statement for resources
 *
 * @param {Object} state - Current state of the Store
 * @param {String} statementId - Statement ID
 * @return {Boolean} if the statement should be added or not
 */
function statementExists(state, statementId) {
    return !!state.statementBrowser.values.allIds.find(id => state.statementBrowser.values.byId[id].statementId === statementId);
}

/**
 * Recursive function to add statements to a resource
 *
 * @param {Array} statements - Statements
 * @param {String} resourceId - The subject id in the SB
 * @param {String} depth - The current depth
 */
export function addStatements(statements, resourceId, depth) {
    return (dispatch, getState) => {
        let resourceStatements = filterStatementsBySubjectId(statements, resourceId);
        // Sort predicates and values by label
        resourceStatements = orderBy(
            resourceStatements,
            [
                resourceStatements => resourceStatements.predicate.label.toLowerCase(),
                resourceStatements => resourceStatements.object.label.toLowerCase()
            ],
            ['asc']
        );

        return Promise.all(
            resourceStatements.map(async statement => {
                // Check whether there already exist a property for this, then combine
                let propertyId = getPropertyIdByByResourceAndPredicateId(getState(), resourceId, statement.predicate.id);
                if (!propertyId) {
                    // Create the property
                    propertyId = guid();
                    dispatch(
                        createProperty({
                            propertyId: propertyId,
                            resourceId: resourceId,
                            existingPredicateId: statement.predicate.id,
                            isExistingProperty: true,
                            ...statement.predicate
                        })
                    );
                }
                let addStatement = Promise.resolve();
                if (!statementExists(getState(), statement.id)) {
                    // add the value if the statement doesn't exist
                    const valueId = guid();
                    addStatement = dispatch(
                        createValueAction({
                            valueId: valueId,
                            existingResourceId: statement.object.id,
                            propertyId: propertyId,
                            isExistingValue: true,
                            existingStatement: true,
                            statementId: statement.id,
                            statementCreatedBy: statement.created_by,
                            statementCreatedAt: statement.created_at,
                            isFetched: depth > 1 ? true : false,
                            fetchedDepth: depth - 1,
                            ...statement.object
                        })
                    );
                }
                return addStatement.then(() => {
                    // check if statement.object.id is not already loaded (propertyIds.length===0)
                    const resource = getState().statementBrowser.resources.byId[statement.object.id];
                    //resource.propertyIds?.length === 0
                    if (filterStatementsBySubjectId(statements, statement.object.id)?.length && resource?.propertyIds?.length === 0) {
                        // Add required properties and add statements
                        return dispatch(createRequiredPropertiesInResource(statement.object.id))
                            .then(() => dispatch(addStatements(statements, statement.object.id, depth - 1)))
                            .then(() => {
                                // Set the resource as fetched
                                dispatch(
                                    setIsFetchedStatements({
                                        resourceId: statement.object.id,
                                        depth: depth - 1
                                    })
                                );
                            });
                    } else {
                        return Promise.resolve();
                    }
                });
            })
        );
    };
}

/**
 * Fetch statements of a resource
 *
 * @param {String} resourceId - Resource ID
 * @param {String} rootNodeType - root node type (predicate|resource|class), no resolving endpoint yet!
 * @param {Number} depth - The required depth
 * @return {Promise} Promise object
 */
export const fetchStatementsForResource = ({ resourceId, rootNodeType = ENTITIES.RESOURCE, depth = 1 }) => {
    return (dispatch, getState) => {
        if (shouldFetchStatementsForResource(getState(), resourceId, depth, rootNodeType)) {
            dispatch(setIsFetchingStatements({ resourceId }));
            // Get the resource classes
            return getEntity(rootNodeType, resourceId)
                .then(root => {
                    // We have custom templates for predicates and classes
                    // so add the corresponding classes on the root node
                    const mapEntitiesClasses = {
                        [ENTITIES.PREDICATE]: [CLASSES.PREDICATE],
                        [ENTITIES.CLASS]: [CLASSES.CLASS],
                        [ENTITIES.RESOURCE]: root.classes ?? []
                    };
                    let allClasses = mapEntitiesClasses[rootNodeType];
                    // set the resource classes (initialize doesn't set the classes)
                    dispatch(updateResourceClasses({ resourceId, classes: allClasses, syncBackend: false }));
                    // update shared counter

                    dispatch(
                        updateResourceShared({
                            resourceId: resourceId,
                            shared: root.shared ?? 1
                        })
                    );
                    // fetch the statements
                    return getStatementsBundleBySubject({ id: resourceId, maxLevel: depth }).then(response => {
                        // 1 - collect all classes Ids
                        allClasses = uniq([
                            ...allClasses,
                            ...flatten(
                                response.statements
                                    .map(s => s.object)
                                    .filter(o => o.classes)
                                    .map(o => o.classes)
                            )
                        ]);
                        // 3 - load templates
                        const templatesOfClassesLoading = allClasses && allClasses?.map(classID => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
                        return Promise.all(templatesOfClassesLoading)
                            .then(() => dispatch(createRequiredPropertiesInResource(resourceId))) // Add required properties
                            .then(() => dispatch(addStatements(response.statements, resourceId, depth))) // Add statements
                            .then(() => {
                                // Set fetching is done
                                dispatch(doneFetchingStatements({ resourceId }));
                                dispatch(
                                    setIsFetchedStatements({
                                        resourceId: resourceId,
                                        depth: depth
                                    })
                                );
                            });
                    });
                })
                .catch(e => {
                    console.log(e);
                    dispatch(
                        setFailedFetchingStatements({
                            resourceId: resourceId
                        })
                    );
                });
        } else {
            return Promise.resolve();
        }
    };
};

/**
 * Check if the input filed is Literal
 *  (if one of the default data type: Date, String, Number)
 * @param {Object[]} components Array of components
 * @return {Boolean} if this input field is Literal
 */
export const isLiteral = components => {
    let isLiteral = false;
    for (const typeId of components.map(tc => tc.value?.id)) {
        if (
            DATA_TYPES.filter(dt => dt._class === ENTITIES.LITERAL)
                .map(t => t.classId)
                .includes(typeId)
        ) {
            isLiteral = true;
            break;
        }
    }
    return isLiteral;
};

/**
 * Get the type of value
 * @param {Object[]} components Array of components
 * @return {Object=} the class of value or null
 */
export const getValueClass = components => {
    return components && components.length > 0 && components[0].value && components[0].value.id ? components[0].value : null;
};

/**
 * Check if the class has an inline format
 * (its template has hasLabelFormat == true)
 * @param {Object} state Current state of the Store
 * @param {Object[]} valueClass Class ID
 * @return {String|Boolean} the template label or false
 */
export function isInlineResource(state, valueClass) {
    if (
        valueClass &&
        !DATA_TYPES.filter(dt => dt._class === ENTITIES.LITERAL)
            .map(t => t.classId)
            .includes(valueClass.id)
    ) {
        if (state.statementBrowser.classes[valueClass.id] && state.statementBrowser.classes[valueClass.id].templateIds) {
            const templateIds = state.statementBrowser.classes[valueClass.id].templateIds;
            //check if it's an inline resource
            for (const templateId of templateIds) {
                const template = state.statementBrowser.templates[templateId];
                if (template && template.hasLabelFormat) {
                    return template.label;
                }
            }
        }
    }
    return false;
}

/**
 * Check if a value has an inline format
 * (its template has hasLabelFormat == true)
 * @param {Object} state Current state of the Store
 * @param {Object[]} valueId Value ID
 * @return {Boolean} true or false
 */
export function isValueHasFormattedLabel(state, valueId) {
    const value = state.statementBrowser.values.byId[valueId];
    return value.classes?.some(elt => isInlineResource(state, elt));
}

/**
 * Get formatted label of resource
 * @param {String} resource Resource object
 * @param {String} labelFormat Current state of the Store
 * @return {String} Formatted label
 */
export function generatedFormattedLabel(resource, labelFormat) {
    return (dispatch, getState) => {
        const valueObject = {};
        for (const propertyId of resource.propertyIds) {
            const property = getState().statementBrowser.properties.byId[propertyId];
            valueObject[property.existingPredicateId] =
                property?.valueIds && property.valueIds.length > 0
                    ? getState().statementBrowser.values.byId[property.valueIds[0]].label
                    : property.label;
        }
        if (Object.keys(valueObject).length > 0) {
            return format(labelFormat, valueObject);
        } else {
            return resource.label;
        }
    };
}

/**
 * Get Subject ID of a value
 * @param {Object} state Current state of the Store
 * @param {String} valueId Value ID
 * @return {String} subject id
 */
export function getSubjectIdByValue(state, valueId) {
    const value = state.statementBrowser.values.byId[valueId];
    const predicate = state.statementBrowser.properties.byId[value.propertyId];
    return predicate?.resourceId;
}
