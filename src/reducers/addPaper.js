import * as type from '../actions/types';
import merge from 'lodash/merge';
import dotProp from 'dot-prop-immutable';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';

const initialState = {
    isTourOpen: false,
    showAbstractDialog: false,
    abstractDialogView: 'annotator', // annotator | input | list
    currentStep: 1,
    shouldBlockNavigation: false,
    tourStartAt: 0,
    title: '',
    authors: [],
    abstract: '',
    publicationMonth: '',
    publicationYear: '',
    entry: '',
    showLookupTable: false,
    doi: '',
    publishedIn: '',
    researchFields: [],
    selectedResearchField: '',
    selectedContribution: '',
    paperNewResourceId: null,
    url: '',
    ranges: {},
    contributions: {
        byId: {},
        allIds: []
    }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = initialState, action) => {
    switch (action.type) {
        case type.UPDATE_GENERAL_DATA: {
            const { payload } = action;

            return {
                ...state,
                title: payload.title,
                authors: payload.authors,
                publicationMonth: payload.publicationMonth,
                publicationYear: payload.publicationYear,
                doi: payload.doi,
                entry: payload.entry,
                showLookupTable: payload.showLookupTable,
                publishedIn: payload.publishedIn,
                url: payload.url
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

        case type.ADD_PAPER_BLOCK_NAVIGATION: {
            return {
                ...state,
                shouldBlockNavigation: true
            };
        }

        case type.ADD_PAPER_UNBLOCK_NAVIGATION: {
            return {
                ...state,
                shouldBlockNavigation: false
            };
        }

        case type.ADD_PAPER_LOAD_DATA: {
            const { payload } = action;
            return {
                ...payload
            };
        }

        case type.CLOSE_TOUR: {
            const cookies = new Cookies();
            if (cookies.get('taketourClosed')) {
                return {
                    ...state,
                    isTourOpen: false
                };
            } else {
                cookies.set('taketourClosed', true, { path: env('PUBLIC_URL'), maxAge: 604800 });
                return {
                    ...state,
                    isTourOpen: false
                };
            }
        }

        case type.OPEN_TOUR: {
            const { payload } = action;

            return {
                ...state,
                isTourOpen: true,
                tourStartAt: payload.step ? payload.step : 0
            };
        }

        case type.UPDATE_RESEARCH_FIELD: {
            const { payload } = action;

            return {
                ...state,
                researchFields: payload.researchFields,
                selectedResearchField: payload.selectedResearchField
            };
        }

        case type.UPDATE_ABSTRACT: {
            const { payload } = action;

            return {
                ...state,
                abstract: payload
            };
        }

        case type.CREATE_ANNOTATION: {
            const { payload } = action;
            return {
                ...dotProp.set(state, `ranges.${payload.id}`, payload)
            };
        }

        case type.REMOVE_ANNOTATION: {
            const { payload } = action;
            return {
                ...dotProp.delete(state, `ranges.${[payload.id]}`)
            };
        }

        case type.TOGGLE_EDIT_ANNOTATION: {
            const { payload } = action;
            return {
                ...dotProp.set(state, `ranges.${payload}.isEditing`, v => !v)
            };
        }

        case type.VALIDATE_ANNOTATION: {
            const { payload } = action;
            return {
                ...dotProp.set(state, `ranges.${payload}.certainty`, 1)
            };
        }

        case type.UPDATE_ANNOTATION_CLASS: {
            const { payload } = action;
            const newstate = dotProp.set(state, `ranges.${[payload.range.id]}.class`, {
                id: payload.selectedOption.id,
                label: payload.selectedOption.label
            });
            return {
                ...dotProp.set(newstate, `ranges.${[payload.range.id]}.certainty`, 1)
            };
        }

        case type.CLEAR_ANNOTATIONS: {
            return {
                ...dotProp.set(state, 'ranges', {})
            };
        }

        case type.CREATE_CONTRIBUTION: {
            const { payload } = action;
            const contribution = {
                contributions: {
                    byId: {
                        [payload.id]: {
                            id: payload.id,
                            label: payload.label,
                            researchProblems: [],
                            resourceId: payload.resourceId
                        }
                    },
                    allIds: [...state.contributions.allIds, payload.id]
                }
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
                    selectedContribution: payload.id
                    //selectedResource: payload.resourceId, //also set the selected resource id
                };
            }

            return merge({}, state, contribution, selectedContribution);
        }

        case type.TOGGLE_ABSTRACT_DIALOG: {
            return dotProp.set(state, 'showAbstractDialog', v => !v);
        }

        case type.SET_ABSTRACT_DIALOG_VIEW: {
            const { payload } = action;
            return dotProp.set(state, 'abstractDialogView', payload.value);
        }

        case type.DELETE_CONTRIBUTION: {
            const { payload } = action;
            //let newState = { ...state };

            // delete both from byId and allIds
            // TODO: states are immutable, so replace this code by building a new state object
            //newState.contributions.byId = omit(newState.contributions.byId, payload.id);
            //newState.contributions.allIds = newState.contributions.allIds.filter((val) => val !== payload.id);

            const contribution = {
                contributions: {
                    byId: Object.assign(
                        {},
                        ...Object.keys(state.contributions.byId)
                            .filter(contributionId => contributionId !== payload.id)
                            .map(k => ({ [k]: state.contributions.byId[k] }))
                    ),
                    allIds: [...state.contributions.allIds.filter(contributionId => contributionId !== payload.id)]
                }
            };

            return {
                ...state,
                ...contribution,
                selectedContribution: state.contributions.allIds[0] //select the first contribution
            };
        }

        case type.SELECT_CONTRIBUTION: {
            const { payload } = action;

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
                level: 0
            };
        }

        case type.UPDATE_CONTRIBUTION_LABEL: {
            const { payload } = action;

            return dotProp.set(state, `contributions.byId.${payload.contributionId}.label`, payload.label);
        }

        case type.UPDATE_RESEARCH_PROBLEMS: {
            const { payload } = action;

            return dotProp.set(state, `contributions.byId.${payload.contributionId}.researchProblems`, payload.problemsArray);
        }

        case type.SAVE_ADD_PAPER: {
            return {
                ...state,
                paperNewResourceId: action.id
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
