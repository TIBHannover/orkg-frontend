import * as type from '../actions/types';
import merge from 'lodash/merge';
import dotProp from 'dot-prop-immutable';

// TODO: for now this reducer is rather large, maybe split up later in smaller chunks 
const initialState = {
    currentStep: 1,
    title: '',
    authors: [],
    publicationMonth: 1,
    publicationYear: 2000,
    doi: '',
    researchFields: [],
    selectedResearchField: null,
    selectedContribution: null,
    selectedResource: null,
    selectedProperty: null,
    level: 0,
    contributions: {
        byId: {},
        allIds: []
    },
    resources: {
        byId: {},
        allIds: [],
    },
    properties: {
        byId: {},
        allIds: [],
    },
    values: {
        byId: {},
        allIds: [],
    },
    resourceHistory: {
        byId: {},
        allIds: [],
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case type.UPFATE_GENERAL_DATA: {
            let { payload } = action;

            return {
                ...state,
                title: payload.title,
                authors: payload.authors,
                publicationMonth: payload.authors,
                publicationYear: payload.authors,
                doi: payload.doi,
            };
        }

        case type.ADD_PAPER_NEXT_STEP: {
            return {
                ...state,
                currentStep: state.currentStep + 1
            };
        }

        case type.ADD_PAPER_PREVIOUS_STEP: {
            return {
                ...state,
                currentStep: state.currentStep - 1
            };
        }

        case type.UPDATE_RESEARCH_FIELD: {
            let { payload } = action;

            return {
                ...state,
                researchFields: payload.researchFields,
                selectedResearchField: payload.selectedResearchField,
            };
        }

        case type.CREATE_CONTRIBUTION: {
            let { payload } = action;
            let contribution = {
                contributions: {
                    byId: {
                        [payload.id]: {
                            id: payload.id,
                            researchProblems: [],
                            resourceId: payload.resourceId,
                        }
                    },
                    allIds: [
                        ...state.contributions.allIds,
                        payload.id
                    ]
                }
            }

            let resources = {
                resources: {
                    byId: {
                        [payload.resourceId]: {
                            id: payload.resourceId,
                            label: '', //blank label for the contribution resource
                            propertyIds: [],
                        }
                    },
                    allIds: [
                        ...state.resources.allIds,
                        payload.resourceId,
                    ]
                }
            }

            let selectedContribution = {};
            // if this is the first contribution, select it 
            if (state.contributions.allIds.length === 0) {
                selectedContribution = {
                    selectedContribution: payload.id,
                    selectedResource: payload.resourceId, //also set the selected resource id
                }
                
            }
            console.log(selectedContribution);
            return merge({}, state, contribution, selectedContribution, resources);
        }

        case type.DELETE_CONTRIBUTION: {
            let { payload } = action;
            //let newState = { ...state };

            // delete both from byId and allIds
            // TODO states are immutable, so replace this code by building a new state object
            //newState.contributions.byId = omit(newState.contributions.byId, payload.id);
            //newState.contributions.allIds = newState.contributions.allIds.filter((val) => val !== payload.id);

            let contribution = {
                contributions: {
                    byId: Object.assign(
                        {},
                        ...Object.keys(state.contributions.byId)
                            .filter((contributionId) => contributionId !== payload.id)
                            .map(k => ({ [k]: state.contributions.byId[k] }))
                    ),
                    allIds: [
                        ...state.contributions.allIds.filter((contributionId) => contributionId != payload.id),
                    ]
                }
            }

            return {
                ...state,
                ...contribution,
                selectedContribution: state.contributions.allIds[0], //select the first contribution
            };
        }

        case type.SELECT_CONTRIBUTION: {
            let { payload } = action;

            let contributionId;
            if (payload.id === undefined) { // if no id is provided, select the first contribution (happens in case of contribution deletion)
                if (state.contributions.allIds.length === 0) { //if there are not contributions, dont select one
                    return state;
                }
                contributionId = state.contributions.allIds[0];
            } else {
                contributionId = payload.id;
            }

            return {
                ...state,
                selectedContribution: contributionId,
                selectedResource: state.contributions.byId[contributionId].resourceId,
                level: 0,
            };
        }

        case type.UPDATE_RESEARCH_PROBLEMS: {
            let { payload } = action;

            return dotProp.set(state, `contributions.byId.${payload.contributionId}.researchProblems`, payload.problemsArray);
        }

        case type.CREATE_RESOURCE: {
            let { payload } = action;

            let newState = dotProp.set(state, `resources.byId`, ids => ({
                ...ids,
                [payload.resourceId]: {
                    label: payload.label ? payload.label : '',
                    existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                    propertyIds: [],
                }
            }));

            newState = dotProp.set(newState, `resources.allIds`, ids => [...ids, payload.resourceId]);
  
            return newState;
        }

        case type.TOGGLE_PROPERTY_COLLAPSE: {
            return {
                ...state,
                selectedProperty: action.id !== state.selectedProperty ? action.id : null
            };
        }

        case type.CREATE_PROPERTY: {
            let { payload } = action;

            let newState = dotProp.set(state, `resources.byId.${payload.resourceId}.propertyIds`, propertyIds => [...propertyIds, payload.propertyId]);
            
            newState = dotProp.set(newState, `properties.byId`, ids => ({
                ...ids,
                [payload.propertyId]: {
                    label: payload.label ? payload.label : '',
                    existingPredicateId: payload.existingPredicateId ? payload.existingPredicateId : null,
                    valueIds: [],
                }
            }));

            newState = dotProp.set(newState, `properties.allIds`, ids => [...ids, payload.propertyId]);
  
            return newState;
        }

        case type.DELETE_PROPERTY: {
            let { payload } = action;

            let newState = dotProp.delete(state, `properties.byId.${payload.id}`);

            let propertyIndex = dotProp.get(newState, `properties.allIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.allIds.${propertyIndex}`);

            let resourceIndex = dotProp.get(newState, `resources.byId.${payload.resourceId}.propertyIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `resources.byId.${payload.resourceId}.propertyIds.${resourceIndex}`);

            // TODO: maybe also delete related values, so it becomes easier to make the API call later?
            
            return newState;
        }

        case type.CREATE_VALUE: {
            let { payload } = action;

            let newState = dotProp.set(state, `properties.byId.${payload.propertyId}.valueIds`, valueIds => [...valueIds, payload.valueId]);
            
            newState = dotProp.set(newState, `values.byId`, ids => ({
                ...ids,
                [payload.valueId]: {
                    type: payload.type,
                    label: payload.label ? payload.label : '',
                    resourceId: payload.resourceId ? payload.resourceId : null,
                }
            }));

            newState = dotProp.set(newState, `values.allIds`, ids => [...ids, payload.valueId]);

            // TODO is the same as creating a resource in the contributions, so make a function 
            // add a new resource when a object value is created

            //only create a new object when the id doesn't exist yet (for sharing changes on existing resources)
            if (payload.type === 'object' && !state.resources.byId[payload.resourceId]) {
                newState = dotProp.set(newState, `resources.allIds`, ids => [...ids, payload.resourceId]);
                
                newState = dotProp.set(newState, `resources.byId`, ids => ({
                    ...ids,
                    [payload.resourceId]: {
                        existingResourceId: payload.existingResourceId ? payload.existingResourceId : null,
                        id: payload.resourceId,
                        label: payload.label, 
                        propertyIds: [],
                    }
                }));
            }
  
            return newState;
        }

        case type.DELETE_VALUE: {
            let { payload } = action;
            console.log('payload', payload);
            let newState = dotProp.delete(state, `values.byId.${payload.id}`);

            let valueIndex = dotProp.get(newState, `values.allIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `values.allIds.${valueIndex}`);

            let propertyIndex = dotProp.get(newState, `properties.byId.${payload.propertyId}.valueIds`).indexOf(payload.id);
            newState = dotProp.delete(newState, `properties.byId.${payload.propertyId}.valueIds.${propertyIndex}`);
            
            return newState;
        }

        case type.SELECT_RESOURCE: {
            let { payload } = action;
            let level = payload.increaseLevel ? state.level + 1 : state.level - 1;

            return {
                ...state,
                selectedResource: payload.resourceId,
                level
            };
        }

        case type.ADD_RESOURCE_HISTORY: {
            let { payload } = action;
            let resourceId = payload.resourceId ? payload.resourceId : state.contributions.byId[state.selectedContribution].resourceId;

            let newState = dotProp.set(state, `resourceHistory.byId`, ids => ({
                ...ids,
                [resourceId]: {
                    id: resourceId,
                    label: payload.label,
                }
            }));

            newState = dotProp.set(newState, `resourceHistory.allIds`, ids => [...ids, resourceId]);

            return newState;
        }

        case type.GOTO_RESOURCE_HISTORY: {
            let { payload } = action;
            let ids = state.resourceHistory.allIds.slice(0, payload.historyIndex + 1); //TODO: it looks like historyIndex can be derived, so remove it from payload

            return {
                ...state,
                level: payload.historyIndex,
                selectedResource: payload.id,
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
                    allIds: [],
                }
            };
        }

        case type.CLEAR_SELECTED_PROPERTY: {
            return {
                ...state,
                selectedProperty: null,
            };
        }

        case type.ADD_FETCHED_STATEMENT: {
            let { payload } = action; 

            console.log('add fetched statement', payload);

            return {
                ...state,
            }
        }

        case type.SET_STATEMENT_IS_FECHTED: {
            let { resourceId } = action; 

            let newState = dotProp.set(state, `resources.byId.${resourceId}.isFechted`, true);

            return {
                ...newState,
            }
        }

        default: {
            return state
        }
    }
}