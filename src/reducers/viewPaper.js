import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';
import assign from 'lodash/assign';
import { Cookies } from 'react-cookie';

const initialState = {
    researchProblems: {},
    comparison: {
        byId: {},
        allIds: []
    },
}
const cookies = new Cookies();

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
            let newComparison = payload
            return {
                ...state,
                comparison: newComparison
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
            let newComparison = {
                allIds: [...state.comparison.allIds, payload.contributionId],
                byId: comparisonContributions
            }
            cookies.set('comparison', newComparison, { path: '/', maxAge: 604800 });
            return {
                ...state,
                comparison: newComparison
            }
        }

        case type.REMOVE_FROM_COMPARISON: {
            let { payload } = action;

            let valueIndex = dotProp.get(state, 'comparison.allIds').indexOf(payload.id);
            let newState = dotProp.delete(state, `comparison.allIds.${valueIndex}`);
            let newComparison = {
                allIds: newState.comparison.allIds,
                byId: dotProp.delete(state.comparison.byId, payload.id),
            }
            cookies.set('comparison', newComparison, { path: '/', maxAge: 604800 });
            return {
                ...newState,
                comparison: newComparison
            }
        }

        default: {
            return state
        }
    }
}