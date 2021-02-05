import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';
import { MISC } from 'constants/graphSettings';
import { match } from 'path-to-regexp';
import ROUTES from 'constants/routes';

const initialState = {
    selectedResource: '',
    selectedProperty: '',
    level: 0,
    isFetchingStatements: false,
    openExistingResourcesInDialog: false,
    propertiesAsLinks: false, // if false the link appears in black font color and opens in a new window
    resourcesAsLinks: false,
    initOnLocationChange: true,
    keyToKeepStateOnLocationChange: null,
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

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
    switch (action.type) {
        case type.CREATE_RESOURCE: {
            const { payload } = action;

            let newState = dotProp.set(state, 'resources.byId', ids => ({
                ...ids,
                [payload.resourceId]: {
                    label: payload.label ? payload.label : '',
                    existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                    shared: payload.shared ? payload.shared : 1,
                    propertyIds: [],
                    classes: payload.classes ? payload.classes : []
                }
            }));

            newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

            return newState;
        }

        case type.CREATE_TEMPLATE: {
            const { payload } = action;
            let newState = dotProp.set(state, `templates.${payload.id}`, payload);
            if (dotProp.get(state, `classes.${payload.class.id}`) && dotProp.get(state, `classes.${payload.class.id}.templateIds`)) {
                newState = dotProp.set(newState, `classes.${payload.class.id}.templateIds`, ids => [...ids, payload.id]);
            } else {
                newState = dotProp.set(newState, `classes.${payload.class.id}`, { ...payload.class, templateIds: [payload.id] });
            }
            return newState;
        }

        case type.IS_FETCHING_TEMPLATES_OF_CLASS: {
            const { classID } = action;

            let newState = dotProp.set(state, `classes.${classID}.isFetching`, true);
            newState = dotProp.set(newState, `classes.${classID}.templateIds`, []); // in case there is no template for this class
            return {
                ...newState
            };
        }

        case type.DONE_FETCHING_TEMPLATES_OF_CLASS: {
            const { classID } = action;

            const newState = dotProp.set(state, `classes.${classID}.isFetching`, false);

            return {
                ...newState
            };
        }

        case type.IS_FETCHING_TEMPLATE_DATA: {
            const { templateID } = action;

            const newState = dotProp.set(state, `templates.${templateID}.isFetching`, true);

            return {
                ...newState
            };
        }

        case type.DONE_FETCHING_TEMPLATE_DATA: {
            const { templateID } = action;

            const newState = dotProp.set(state, `templates.${templateID}.isFetching`, false);

            return {
                ...newState
            };
        }

        case type.CREATE_PROPERTY: {
            const { payload } = action;
            let newState;
            if (
                dotProp.get(state, `resources.byId.${payload.resourceId}`) &&
                dotProp.get(state, `resources.byId.${payload.resourceId}.propertyIds`)
            ) {
                newState = dotProp.set(state, `resources.byId.${payload.resourceId}.propertyIds`, propertyIds => [
                    ...propertyIds,
                    payload.propertyId
                ]);
                newState = dotProp.set(newState, 'properties.byId', ids => ({
                    ...ids,
                    [payload.propertyId]: {
                        label: payload.label ? payload.label : '',
                        existingPredicateId: payload.existingPredicateId ? payload.existingPredicateId : null,
                        valueIds: [],
                        isExistingProperty: payload.isExistingProperty ? payload.isExistingProperty : false,
                        isEditing: false,
                        isSaving: false,
                        isTemplate: payload.isTemplate,
                        isAnimated: payload.isAnimated !== undefined ? payload.isAnimated : false,
                        range: payload.range ? payload.range : null,
                        validationRules: payload.validationRules ? payload.validationRules : {},
                        minOccurs: payload.minOccurs ? payload.minOccurs : 0,
                        maxOccurs: payload.maxOccurs ? payload.maxOccurs : null
                    }
                }));
                newState = dotProp.set(newState, 'properties.allIds', ids => [...ids, payload.propertyId]);
            }
            if (payload.createAndSelect) {
                newState = dotProp.set(newState, 'selectedProperty', payload.propertyId);
            }
            return newState ? newState : state;
        }

        case type.DELETE_PROPERTY: {
            const { payload } = action;

            let newState = dotProp.delete(state, `properties.byId.${payload.id}`);

            const propertyIndex = dotProp.get(newState, 'properties.allIds').indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.allIds.${propertyIndex}`);

            const resourceIndex = dotProp.get(newState, `resources.byId.${payload.resourceId}.propertyIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `resources.byId.${payload.resourceId}.propertyIds.${resourceIndex}`);

            // TODO: maybe also delete related values, so it becomes easier to make the API call later?

            return newState;
        }

        case type.UPDATE_PROPERTY_LABEL: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.propertyId}.label`, payload.label);
            return newState;
        }

        case type.CHANGE_PROPERTY: {
            const { payload } = action;
            let newState = dotProp.set(state, `properties.byId.${payload.propertyId}.label`, payload.newProperty.label);
            newState = dotProp.set(
                newState,
                `properties.byId.${payload.propertyId}.existingPredicateId`,
                payload.newProperty.isExistingProperty ? payload.newProperty.id : false
            );
            newState = dotProp.set(newState, `properties.byId.${payload.propertyId}.isExistingProperty`, payload.newProperty.isExistingProperty);
            return newState;
        }

        case type.TOGGLE_EDIT_PROPERTY_LABEL: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isEditing`, v => !v);
            return newState;
        }

        case type.IS_SAVING_PROPERTY: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isSaving`, v => true);
            return newState;
        }

        case type.DONE_ANIMATION: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isAnimated`, v => true);
            return newState;
        }

        case type.DONE_SAVING_PROPERTY: {
            const { payload } = action;
            const newState = dotProp.set(state, `properties.byId.${payload.id}.isSaving`, v => false);
            return newState;
        }

        case type.CREATE_VALUE: {
            const { payload } = action;
            let newState;
            if (dotProp.get(state, `properties.byId.${payload.propertyId}`)) {
                newState = dotProp.set(state, `properties.byId.${payload.propertyId}.valueIds`, valueIds => [...valueIds, payload.valueId]);

                newState = dotProp.set(newState, 'values.byId', ids => ({
                    ...ids,
                    [payload.valueId]: {
                        type: payload.type,
                        classes: payload.classes ? payload.classes : [],
                        label: payload.label ? payload.label : '',
                        resourceId: payload.resourceId ? payload.resourceId : null,
                        isExistingValue: payload.isExistingValue ? payload.isExistingValue : false,
                        existingStatement: payload.existingStatement ? payload.existingStatement : false,
                        statementId: payload.statementId,
                        ...(payload.type === 'literal' && { datatype: payload.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE }),
                        isEditing: false,
                        isSaving: false,
                        shared: payload.shared ? payload.shared : 1
                    }
                }));

                newState = dotProp.set(newState, 'values.allIds', ids => [...ids, payload.valueId]);

                // TODO: is the same as creating a resource in the contributions, so make a function
                // add a new resource when a object value is created

                //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
                if ((payload.type === 'object' || payload.type === 'template') && !state.resources.byId[payload.resourceId]) {
                    newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

                    newState = dotProp.set(newState, 'resources.byId', ids => ({
                        ...ids,
                        [payload.resourceId]: {
                            existingResourceId: payload.existingResourceId && payload.isExistingValue ? payload.existingResourceId : null,
                            id: payload.resourceId,
                            label: payload.label,
                            shared: payload.shared ? payload.shared : 1,
                            propertyIds: [],
                            classes: payload.classes ? payload.classes : []
                        }
                    }));
                }
            }
            return newState ? newState : state;
        }

        case type.DELETE_VALUE: {
            const { payload } = action;

            let newState = dotProp.delete(state, `values.byId.${payload.id}`);

            const valueIndex = dotProp.get(newState, 'values.allIds').indexOf(payload.id);
            newState = dotProp.delete(newState, `values.allIds.${valueIndex}`);

            const propertyIndex = dotProp.get(newState, `properties.byId.${payload.propertyId}.valueIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.byId.${payload.propertyId}.valueIds.${propertyIndex}`);

            return newState;
        }

        case type.CHANGE_VALUE: {
            const { payload } = action;
            let newState;
            if (dotProp.get(state, `values.byId.${payload.valueId}`)) {
                newState = dotProp.set(state, `values.byId.${payload.valueId}`, v => ({
                    type: v.type,
                    classes: payload.classes ? payload.classes : [],
                    label: payload.label ? payload.label : '',
                    ...(v.type === 'literal' && { datatype: payload.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE }),
                    resourceId: payload.resourceId ? payload.resourceId : null,
                    isExistingValue: payload.isExistingValue ? payload.isExistingValue : false,
                    existingStatement: payload.existingStatement ? payload.existingStatement : false,
                    statementId: payload.statementId ? payload.statementId : null,
                    isEditing: v.isEditing,
                    isSaving: v.isSaving,
                    shared: payload.shared ? payload.shared : 1
                }));
                //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
                if (!state.resources.byId[payload.resourceId]) {
                    newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

                    newState = dotProp.set(newState, 'resources.byId', ids => ({
                        ...ids,
                        [payload.resourceId]: {
                            existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                            id: payload.resourceId,
                            label: payload.label,
                            shared: payload.shared ? payload.shared : 1,
                            propertyIds: [],
                            classes: payload.classes ? payload.classes : []
                        }
                    }));
                }
            }
            return newState ? newState : state;
        }

        case type.IS_SAVING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isSaving`, v => true);
            return newState;
        }

        case type.DONE_SAVING_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isSaving`, v => false);
            return newState;
        }

        case type.TOGGLE_EDIT_VALUE: {
            const { payload } = action;
            const newState = dotProp.set(state, `values.byId.${payload.id}.isEditing`, v => !v);
            return newState;
        }

        case type.UPDATE_RESOURCE_CLASSES: {
            const { payload } = action;
            const newState = dotProp.set(state, `resources.byId.${payload.resourceId}.classes`, payload.classes);
            return newState;
        }

        case type.UPDATE_VALUE_LABEL: {
            const { payload } = action;
            let newState = dotProp.set(state, `values.byId.${payload.valueId}.label`, payload.label);
            // Update all the labels of the same resource ID
            const resourceId = dotProp.get(state, `values.byId.${payload.valueId}.resourceId`);
            if (resourceId) {
                newState = dotProp.set(newState, `resources.byId.${resourceId}.label`, payload.label);
                for (const valueId of newState.values.allIds) {
                    if (dotProp.get(newState, `values.byId.${valueId}.resourceId`) === resourceId && valueId !== payload.valueId) {
                        newState = dotProp.set(newState, `values.byId.${valueId}.label`, payload.label);
                    }
                }
                // Update the label in resource history
                newState = dotProp.set(newState, `resourceHistory.byId.${resourceId}.label`, payload.label);
            }
            return newState;
        }

        case type.SELECT_RESOURCE: {
            const { payload } = action;
            const level = payload.increaseLevel ? state.level + 1 : state.level - 1;
            if (!state.initOnLocationChange && state.contributions[state.selectedContributionId]) {
                // this wants to update the contribution object
                const contribObj = state.contributions[state.selectedContributionId];
                if (payload.resourceId === state.selectedContributionId) {
                    if (contribObj.selectedResource === '') {
                        // there is no selected data yet;
                        contribObj.selectedResource = payload.resourceId;
                        contribObj.level = level > 0 ? level : 0;
                    }
                } else {
                    // check if this resource exists in the contribution data ;
                    const isContributionResource = !!state.contributions[payload.resourceId];
                    if (!isContributionResource) {
                        contribObj.selectedResource = payload.resourceId;
                        contribObj.level = level > 0 ? level : 0;
                    }
                }
            }

            return {
                ...state,
                selectedResource: payload.resourceId,
                level: level > 0 ? level : 0
            };
        }

        case type.RESET_LEVEL: {
            return {
                ...state,
                level: 0
            };
        }

        case type.ADD_RESOURCE_HISTORY: {
            const { payload } = action;
            const resourceId = payload.resourceId ? payload.resourceId : null; //state.contributions.byId[state.selectedContribution].resourceId
            const lastResourceId = state.resourceHistory.allIds[state.resourceHistory.allIds.length - 1];

            let newState = dotProp.set(state, 'resourceHistory.byId', ids => ({
                ...ids,
                [resourceId]: {
                    id: resourceId,
                    label: payload.label,
                    propertyLabel: payload.propertyLabel
                },
                ...(lastResourceId
                    ? {
                          [lastResourceId]: {
                              ...state.resourceHistory.byId[lastResourceId],
                              selectedProperty: state.selectedProperty
                          }
                      }
                    : {})
            }));

            newState = dotProp.set(newState, 'resourceHistory.allIds', ids => [...ids, resourceId]);

            // overwrite contribution history if needed
            const contribObj = newState.contributions[newState.selectedContributionId];
            if (!state.initOnLocationChange && contribObj) {
                const isContributionResource = !!newState.contributions[resourceId];

                if (!isContributionResource) {
                    contribObj.resourceHistory = newState.resourceHistory;
                } else {
                    if (contribObj.resourceHistory.allIds.length === 0) {
                        // will ignore history updates if there is already some data;
                        contribObj.resourceHistory = newState.resourceHistory;
                    }
                }
            }

            return { ...newState };
        }

        case type.GOTO_RESOURCE_HISTORY: {
            const { payload } = action;
            const ids = state.resourceHistory.allIds.slice(0, payload.historyIndex + 1); //TODO: it looks like historyIndex can be derived, so remove it from payload

            if (!state.initOnLocationChange && state.contributions[state.selectedContributionId]) {
                const contribObj = state.contributions[state.selectedContributionId];
                contribObj.resourceHistory = {
                    byId: {
                        ...state.resourceHistory.byId // TODO: remove the history item from byId object (not really necessary, but it is cleaner)
                    },
                    allIds: ids
                };
                contribObj.level = payload.historyIndex;
                contribObj.selectedResource = payload.id;
                contribObj.selectedProperty = state.resourceHistory.byId[payload.id].selectedProperty;
                state.contributions[state.selectedContributionId] = contribObj;
            }

            return {
                ...state,
                level: payload.historyIndex,
                selectedResource: payload.id,
                selectedProperty: state.resourceHistory.byId[payload.id].selectedProperty,
                resourceHistory: {
                    allIds: ids,
                    byId: {
                        ...state.resourceHistory.byId // TODO: remove the history item from byId object (not really necessary, but it is cleaner)
                    }
                }
            };
        }

        case type.STATEMENT_BROWSER_UPDATE_SETTINGS: {
            const { payload } = action;

            return {
                ...state,
                openExistingResourcesInDialog:
                    typeof payload.openExistingResourcesInDialog === 'boolean'
                        ? payload.openExistingResourcesInDialog
                        : state.openExistingResourcesInDialog,
                propertiesAsLinks: typeof payload.propertiesAsLinks === 'boolean' ? payload.propertiesAsLinks : state.propertiesAsLinks,
                resourcesAsLinks: typeof payload.resourcesAsLinks === 'boolean' ? payload.resourcesAsLinks : state.resourcesAsLinks,
                initOnLocationChange: typeof payload.initOnLocationChange === 'boolean' ? payload.initOnLocationChange : state.initOnLocationChange,
                keyToKeepStateOnLocationChange: payload.keyToKeepStateOnLocationChange ? payload.keyToKeepStateOnLocationChange : null
            };
        }

        case type.CLEAR_RESOURCE_HISTORY: {
            return {
                ...state,
                level: 0,
                resourceHistory: {
                    byId: {},
                    allIds: []
                }
            };
        }

        case type.CLEAR_SELECTED_PROPERTY: {
            return {
                ...state,
                selectedProperty: ''
            };
        }

        case type.STATEMENT_BROWSER_LOAD_DATA: {
            const { payload } = action;
            return {
                ...payload
            };
        }

        case type.ADD_FETCHED_STATEMENT: {
            return {
                ...state
            };
        }

        case type.SET_STATEMENT_IS_FECHTED: {
            const { resourceId, depth } = action;

            let newState = dotProp.set(state, `resources.byId.${resourceId}.isFechted`, true);
            newState = dotProp.set(newState, `resources.byId.${resourceId}.fetshedDepth`, depth);
            newState = dotProp.set(newState, `resources.byId.${resourceId}.isFetching`, false);

            return {
                ...newState
            };
        }

        case type.IS_FETCHING_STATEMENTS: {
            const { resourceId } = action;
            let newState = dotProp.set(state, `isFetchingStatements`, true);
            if (resourceId) {
                newState = dotProp.set(newState, `resources.byId.${resourceId}.isFetching`, true);
                newState = dotProp.set(newState, `resources.byId.${resourceId}.isFechted`, false);
            }

            return {
                ...newState
            };
        }
        case type.STATEMENT_BROWSER_UPDATE_CONTRIBUTION_LABEL: {
            const newLabel = action.payload.label;
            const contribId = action.payload.id;

            let newState = dotProp.set(state, `resources.byId.${contribId}.label`, newLabel);
            newState = dotProp.set(newState, `resourceHistory.byId.${contribId}.label`, newLabel);
            return {
                ...newState
            };
        }

        case type.DONE_FETCHING_STATEMENTS: {
            return {
                ...state,
                isFetchingStatements: false
            };
        }

        case type.RESET_STATEMENT_BROWSER: {
            return initialState;
        }

        case '@@router/LOCATION_CHANGE': {
            //from connected-react-router, reset the wizard when the page is changed
            const matchViewPaper = match(ROUTES.VIEW_PAPER);
            const contributionChange = matchViewPaper(action.payload.location.pathname);

            let newState;
            if (!state.initOnLocationChange && state.keyToKeepStateOnLocationChange === contributionChange?.params?.resourceId) {
                newState = {
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
                newState = initialState;
            }
            return { ...newState };
        }

        /** -- Handling for creation of contribution objects**/
        case type.STATEMENT_BROWSER_CREATE_CONTRIBUTION_OBJECT: {
            state.selectedContributionId = action.payload.id;
            if (!state.contributions.hasOwnProperty(action.payload.id)) {
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
                const updatedState = dotProp.set(state, `contributions.${action.payload.id}`, initData);
                return { ...updatedState };
            }
            return { ...state };
        }

        case type.STATEMENT_BROWSER_LOAD_CONTRIBUTION_HISTORY: {
            const contribObj = state.contributions[action.payload.id];
            if (contribObj) {
                state.selectedResource = contribObj.selectedResource;
                state.selectedProperty = contribObj.selectedProperty;
                state.isFetchingStatements = contribObj.isFetchingStatements;
                state.level = contribObj.level;
                state.resourceHistory = contribObj.resourceHistory;
            }

            return { ...state };
        }

        default: {
            return state;
        }
    }
};
