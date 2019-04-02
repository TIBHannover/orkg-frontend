import * as type from '../actions/types';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import remove from 'lodash/remove';
import set from 'lodash/fp/set'
import dotProp from 'dot-prop-immutable';

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
                        payload.property_id,
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

            return {
                ...state,
                selectedContribution: payload.id,
                selectedResource: state.contributions.byId[payload.id].resourceId,
            };
        }

        case type.UPDATE_RESEARCH_PROBLEMS: {
            let { payload } = action;

            return dotProp.set(state, `contributions.byId.${payload.contributionId}.researchProblems`, payload.problemsArray);
        }

        case type.CREATE_RESOURCE: {
            let { payload } = action;

            //return dotProp.set(state, `resources.byId`, payload.problemsArray);
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

        default: {
            return state
        }
    }
}