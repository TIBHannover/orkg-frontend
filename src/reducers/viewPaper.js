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
    title: '',
    paperResourceId: 0,
    authors: [],
    publicationMonth: 0,
    publicationMonthResourceId: 0,
    publicationYear: 0,
    publicationYearResourceId: 0,
    doi: '',
    doiResourceId: 0,
    researchField: '',
}
const cookies = new Cookies();

export default (state = initialState, action) => {
    switch (action.type) {

        case type.LOAD_PAPER: {
            let { payload } = action;

            return {
                ...state,
                title: typeof payload.title ? payload.title : state.title,
                paperResourceId: typeof payload.paperResourceId !== 'undefined' ? payload.paperResourceId : state.paperResourceId,
                authors: typeof payload.authors !== 'undefined' ? payload.authors : state.authors,
                publicationMonth: typeof payload.publicationMonth !== 'undefined' ? payload.publicationMonth : state.publicationMonth,
                publicationMonthResourceId: typeof payload.publicationMonthResourceId !== 'undefined' ? payload.publicationMonthResourceId : state.publicationMonthResourceId,
                publicationYear: typeof payload.publicationYear !== 'undefined' ? payload.publicationYear : state.publicationYear,
                publicationYearResourceId: typeof payload.publicationYearResourceId !== 'undefined' ? payload.publicationYearResourceId : state.publicationYearResourceId,
                doi: typeof payload.doi !== 'undefined' ? payload.doi : state.doi,
                doiResourceId: typeof payload.doiResourceId !== 'undefined' ? payload.doiResourceId : state.doiResourceId,
                researchField: typeof payload.researchField !== 'undefined' ? payload.researchField : state.researchField,
            }
        }

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