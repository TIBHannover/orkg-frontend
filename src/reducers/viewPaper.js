import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';
import assign from 'lodash/assign';

const initialState = {
    researchProblems: { },
    comparison: {
        byId: {},
        allIds: []
    },
}

export default (state = initialState, action) => {
    switch (action.type) {
       
        case type.SET_RESEARCH_PROBLEMS: { 
            let { payload } = action;

            let newState = dotProp.set(state, 'researchProblems', ids => ({ 
                ...ids, 
                [payload.resourceId]: payload.researchProblems
            }));
            
            return {
                ...newState,
            }
        }

        case type.LOAD_COMPARISON_FROM_COOKIE: {
            let { payload } = action;

            return {
                ...state,
                comparison: {
                    allIds: payload.allIds,
                    byId: payload.byId,
                }
            }
        }

        case type.ADD_TO_COMPARISON: {
            let { payload } = action;

            let comparisonContributions = assign(state.comparison.byId, {
                [payload.contributionId]: {
                    paperId: payload.contributionData.paperId,
                    paperTitle: payload.contributionData.paperTitle,
                    contributionTitle: payload.contributionData.contributionTitle,
                }
            });

            return {
                ...state,
                comparison: {
                    allIds: [...state.comparison.allIds, payload.contributionId],
                    byId: comparisonContributions
                }
            }
        }

        case type.REMOVE_FROM_COMPARISON: {
            let { payload } = action;

            let valueIndex = dotProp.get(state, 'comparison.allIds').indexOf(payload.id);
            let newState = dotProp.delete(state, `comparison.allIds.${valueIndex}`);

            return {
                ...newState,
                comparison: {
                    allIds: newState.comparison.allIds,
                    byId: dotProp.delete(state.comparison.byId, payload.id),
                }
            }
        }

        default: {
            return state
        }
    }
}