import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    selectedResource: '',
    selectedProperty: '',
    level: 0,
    isFetchingStatements: false,
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
    }
};

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
                    propertyIds: []
                }
            }));

            newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

            return newState;
        }

        case type.TOGGLE_PROPERTY_COLLAPSE: {
            return {
                ...state,
                selectedProperty: action.id !== state.selectedProperty ? action.id : ''
            };
        }

        case type.CREATE_PROPERTY: {
            const { payload } = action;
            let newState;
            if (dotProp.get(state, `resources.byId.${payload.resourceId}`)) {
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
                        isSaving: false
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
                        isEditing: false,
                        isSaving: false,
                        shared: payload.shared ? payload.shared : 1
                    }
                }));

                newState = dotProp.set(newState, 'values.allIds', ids => [...ids, payload.valueId]);

                // TODO: is the same as creating a resource in the contributions, so make a function
                // add a new resource when a object value is created

                //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
                if (payload.type === 'object' && !state.resources.byId[payload.resourceId]) {
                    newState = dotProp.set(newState, 'resources.allIds', ids => [...ids, payload.resourceId]);

                    newState = dotProp.set(newState, 'resources.byId', ids => ({
                        ...ids,
                        [payload.resourceId]: {
                            existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                            id: payload.resourceId,
                            label: payload.label,
                            shared: payload.shared ? payload.shared : 1,
                            propertyIds: []
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
                            propertyIds: []
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
                    label: payload.label
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

            return newState;
        }

        case type.GOTO_RESOURCE_HISTORY: {
            const { payload } = action;
            const ids = state.resourceHistory.allIds.slice(0, payload.historyIndex + 1); //TODO: it looks like historyIndex can be derived, so remove it from payload

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

        case type.CLEAR_RESOURCE_HISTORY: {
            return {
                ...state,
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
            const { resourceId } = action;

            const newState = dotProp.set(state, `resources.byId.${resourceId}.isFechted`, true);

            return {
                ...newState
            };
        }

        case type.IS_FETCHING_STATEMENTS: {
            return {
                ...state,
                isFetchingStatements: true
            };
        }

        case type.DONE_FETCHING_STATEMENTS: {
            return {
                ...state,
                isFetchingStatements: false
            };
        }

        case type.RESET_STATEMENT_BROWSER: {
            return {
                ...initialState
            };
        }

        case '@@router/LOCATION_CHANGE': {
            //from connected-react-router, reset the wizard when the page is changed
            return {
                ...initialState
            };
        }

        default: {
            return state;
        }
    }
};
