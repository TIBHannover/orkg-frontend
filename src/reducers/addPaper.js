import * as type from '../actions/types';
import merge from 'lodash/merge';
import dotProp from 'dot-prop-immutable';
import { Cookies } from 'react-cookie';

const initialState = {
    isTourOpen: false,
    currentStep: 1,
    tourCurrentStep: 1,
    tourStartAt: 0,
    title: '',
    authors: [],
    abstract: '',
    publicationMonth: 1,
    publicationYear: 2000,
    entry: '',
    showLookupTable: false,
    doi: '',
    researchFields: [],
    selectedResearchField: '',
    selectedContribution: '',
    paperNewResourceId: null,
    ranges: {},
    contributions: {
        byId: {},
        allIds: [],
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.UPFATE_GENERAL_DATA: {
            let { payload } = action;

            return {
                ...state,
                title: payload.title,
                authors: payload.authors,
                publicationMonth: payload.publicationMonth,
                publicationYear: payload.publicationYear,
                doi: payload.doi,
                entry: payload.entry,
                showLookupTable: payload.showLookupTable,
            };
        }

        case type.ADD_PAPER_NEXT_STEP: {
            return {
                ...state,
                currentStep: state.currentStep + 1,
            };
        }

        case type.ADD_PAPER_PREVIOUS_STEP: {
            return {
                ...state,
                currentStep: state.currentStep - 1,
            };
        }

        case type.UPDATE_TOUR_CURRENT_STEP: {
            let { payload } = action;
            return {
                ...state,
                tourCurrentStep: payload,
            };
        }

        case type.CLOSE_TOUR: {
            const cookies = new Cookies();
            if (cookies.get('taketourClosed')) {
                return {
                    ...state,
                    isTourOpen: false,
                };
            } else {
                cookies.set('taketourClosed', true)
                return {
                    ...state,
                    isTourOpen: false,
                };
            }
        }

        case type.OPEN_TOUR: {
            let { payload } = action;
            
            return {
                ...state,
                isTourOpen: true,
                tourStartAt: payload.step ? payload.step : 0,
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

        case type.UPDATE_ABSTRACT: {
            let { payload } = action;

            return {
                ...state,
                abstract: payload,
            };
        }

        case type.CREATE_ANNOTATION: {
            let { payload } = action;
            return {
                ...dotProp.set(state, `ranges.${payload.id}`, payload)
            };
        }

        case type.REMOVE_ANNOTATION: {
            let { payload } = action;
            return {
                ...dotProp.delete(state, `ranges.${[payload.id]}`),
            };
        }

        case type.VALIDATE_ANNOTATION: {
            let { payload } = action;
            return {
                ...dotProp.set(state, `ranges.${payload}.uncertainty`, 0),
            };
        }

        case type.UPDATE_ANNOTATION_CLASS: {
            let { payload } = action;
            let newstate = dotProp.set(state, `ranges.${[payload.range.id]}.class`, {
                id: payload.selectedOption.id,
                label: payload.selectedOption.label,
            });
            return {
                ...dotProp.set(newstate, `ranges.${[payload.range.id]}.uncertainty`, 0)
            };
        }

        case type.CLEAR_ANNOTATIONS: {
            return {
                ...dotProp.set(state, 'ranges', {})
            };
        }

        case type.CREATE_CONTRIBUTION: {
            let { payload } = action;
            let contribution = {
                contributions: {
                    byId: {
                        [payload.id]: {
                            id: payload.id,
                            label: `Contribution ${state.contributions.allIds.length + 1}`,
                            researchProblems: [],
                            resourceId: payload.resourceId,
                        },
                    },
                    allIds: [...state.contributions.allIds, payload.id],
                },
            };

            /*let resources = {
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
                }*/
            //let resources = {}

            let selectedContribution = {};
            // if this is the first contribution, select it
            if (state.contributions.allIds.length === 0) {
                selectedContribution = {
                    selectedContribution: payload.id,
                    //selectedResource: payload.resourceId, //also set the selected resource id
                };
            }

            return merge({}, state, contribution, selectedContribution);
        }

        case type.DELETE_CONTRIBUTION: {
            let { payload } = action;
            //let newState = { ...state };

            // delete both from byId and allIds
            // TODO: states are immutable, so replace this code by building a new state object
            //newState.contributions.byId = omit(newState.contributions.byId, payload.id);
            //newState.contributions.allIds = newState.contributions.allIds.filter((val) => val !== payload.id);

            let contribution = {
                contributions: {
                    byId: Object.assign(
                        {},
                        ...Object.keys(state.contributions.byId)
                            .filter((contributionId) => contributionId !== payload.id)
                            .map((k) => ({ [k]: state.contributions.byId[k] })),
                    ),
                    allIds: [
                        ...state.contributions.allIds.filter((contributionId) => contributionId !== payload.id),
                    ],
                },
            };

            return {
                ...state,
                ...contribution,
                selectedContribution: state.contributions.allIds[0], //select the first contribution
            };
        }

        case type.SELECT_CONTRIBUTION: {
            let { payload } = action;

            let contributionId;
            if (!payload.id) {
                // if no id is provided, select the first contribution (happens in case of contribution deletion)
                if (state.contributions.allIds.length === 0) {
                    //if there are not contributions, dont select one
                    return state;
                }
                contributionId = state.contributions.allIds[0];
            } else {
                contributionId = payload.id;
            }

            return {
                ...state,
                selectedContribution: contributionId,
                //selectedResource: state.contributions.byId[contributionId].resourceId,
                level: 0,
            };
        }

        case type.UPDATE_CONTRIBUTION_LABEL: {
            let { payload } = action;

            return dotProp.set(
                state,
                `contributions.byId.${payload.contributionId}.label`,
                payload.label,
            );
        }

        case type.UPDATE_RESEARCH_PROBLEMS: {
            let { payload } = action;

            return dotProp.set(
                state,
                `contributions.byId.${payload.contributionId}.researchProblems`,
                payload.problemsArray,
            );
        }

        case type.SAVE_ADD_PAPER: {
            return {
                ...state,
                paperNewResourceId: action.id,
            };
        }

        case '@@router/LOCATION_CHANGE': {
            //from connected-react-router, reset the wizard when the page is changed
            return {
                ...initialState,
            };
        }

        default: {
            return state;
        }
    }
};
