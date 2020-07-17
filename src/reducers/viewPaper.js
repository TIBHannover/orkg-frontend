import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';
import assign from 'lodash/assign';
import { asyncLocalStorage } from 'utils';

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
    researchField: {},
    publishedIn: '',
    url: '',
    urlResourceId: 0
};
//const cookies = new Cookies();

export default (state = initialState, action) => {
    switch (action.type) {
        case type.LOAD_PAPER: {
            const { payload } = action;

            return {
                ...state,
                title: typeof payload.title ? payload.title : state.title,
                paperResourceId: typeof payload.paperResourceId !== 'undefined' ? payload.paperResourceId : state.paperResourceId,
                authors: typeof payload.authors !== 'undefined' ? payload.authors : state.authors,
                publicationMonth: typeof payload.publicationMonth !== 'undefined' ? payload.publicationMonth : state.publicationMonth,
                publicationMonthResourceId:
                    typeof payload.publicationMonthResourceId !== 'undefined' ? payload.publicationMonthResourceId : state.publicationMonthResourceId,
                publicationYear: typeof payload.publicationYear !== 'undefined' ? payload.publicationYear : state.publicationYear,
                publicationYearResourceId:
                    typeof payload.publicationYearResourceId !== 'undefined' ? payload.publicationYearResourceId : state.publicationYearResourceId,
                doi: typeof payload.doi !== 'undefined' ? payload.doi : state.doi,
                doiResourceId: typeof payload.doiResourceId !== 'undefined' ? payload.doiResourceId : state.doiResourceId,
                researchField: typeof payload.researchField !== 'undefined' ? payload.researchField : state.researchField,
                publishedIn: typeof payload.publishedIn !== 'undefined' ? payload.publishedIn : state.publishedIn,
                url: typeof payload.url !== 'undefined' ? payload.url : state.url,
                urlResourceId: typeof payload.urlResourceId !== 'undefined' ? payload.urlResourceId : state.urlResourceId
            };
        }

        case type.SET_RESEARCH_PROBLEMS: {
            const { payload } = action;

            const newState = dotProp.set(state, 'researchProblems', ids => ({
                ...ids,
                [payload.resourceId]: payload.researchProblems
            }));

            return {
                ...newState
            };
        }

        case type.SET_PAPER_AUTHORS: {
            const { payload } = action;

            return dotProp.set(state, 'authors', payload.authors);
        }

        case type.UPDATE_RESEARCH_PROBLEMS: {
            const { payload } = action;

            return dotProp.set(state, `researchProblems.${payload.contributionId}`, payload.problemsArray);
        }

        case type.LOAD_COMPARISON_FROM_LOCAL_STORAGE: {
            const { payload } = action;
            const newComparison = payload;
            return {
                ...state,
                comparison: newComparison
            };
        }

        case type.ADD_TO_COMPARISON: {
            const { payload } = action;

            const comparisonContributions = assign(state.comparison.byId, {
                [payload.contributionId]: {
                    paperId: payload.contributionData.paperId,
                    paperTitle: payload.contributionData.paperTitle,
                    contributionTitle: payload.contributionData.contributionTitle
                }
            });
            const newComparison = {
                allIds: [...state.comparison.allIds, payload.contributionId],
                byId: comparisonContributions
            };
            asyncLocalStorage.setItem('comparison', JSON.stringify(newComparison));
            //cookies.set('comparison', newComparison, { path: process.env.PUBLIC_URL, maxAge: 604800 });
            return {
                ...state,
                comparison: newComparison
            };
        }

        case type.REMOVE_FROM_COMPARISON: {
            const { payload } = action;

            const valueIndex = dotProp.get(state, 'comparison.allIds').indexOf(payload.id);
            const newState = dotProp.delete(state, `comparison.allIds.${valueIndex}`);
            const newComparison = {
                allIds: newState.comparison.allIds,
                byId: dotProp.delete(state.comparison.byId, payload.id)
            };
            asyncLocalStorage.setItem('comparison', JSON.stringify(newComparison));
            //cookies.set('comparison', newComparison, { path: process.env.PUBLIC_URL, maxAge: 604800 });
            return {
                ...newState,
                comparison: newComparison
            };
        }

        default: {
            return state;
        }
    }
};
