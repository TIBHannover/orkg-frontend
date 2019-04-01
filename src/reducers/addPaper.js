import * as type from '../actions/types';

const initialState = {
    currentStep: 1,
    title: '',
    authors: [],
    publicationMonth: 1,
    publicationYear: 2000,
    doi: '',
    researchFields: [],
    selectedResearchField: null,
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

        default: {
            return state
        }
    }
}