import * as type from '../actions/types';

const initialState = {
    label: '',
    editMode: false,
    researchFields: [],
    researchProblems: [],
    predicate: null,
    class: null,
    templateID: '',
    isClassDescription: false,
    hasLabelFormat: false,
    labelFormat: '',
    error: null,
    components: [],
    subTemplates: [],
    isLoading: false,
    statements: [],
    isSaving: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.TEMPLATE_SET_LABEL: {
            const { payload } = action;

            return {
                ...state,
                label: payload
            };
        }

        case type.TEMPLATE_SET_PREDICATE: {
            const { payload } = action;

            return {
                ...state,
                predicate: payload
            };
        }

        case type.TEMPLATE_SET_IS_CLASS_DESCRIPTION: {
            const { payload } = action;

            return {
                ...state,
                isClassDescription: payload
            };
        }

        case type.TEMPLATE_SET_HAS_LABEL_FORMAT: {
            const { payload } = action;

            return {
                ...state,
                hasLabelFormat: payload
            };
        }

        case type.TEMPLATE_SET_LABEL_FORMAT: {
            const { payload } = action;

            return {
                ...state,
                labelFormat: payload
            };
        }

        case type.TEMPLATE_SET_CLASS: {
            const { payload } = action;

            return {
                ...state,
                class: payload
            };
        }

        case type.TEMPLATE_SET_RESEARCH_PROBLEMS: {
            const { payload } = action;

            return {
                ...state,
                researchProblems: payload
            };
        }

        case type.TEMPLATE_SET_RESEARCH_FIELDS: {
            const { payload } = action;

            return {
                ...state,
                researchFields: payload
            };
        }

        case type.TEMPLATE_SET_EDIT_MODE: {
            const { payload } = action;

            return {
                ...state,
                editMode: payload
            };
        }

        case type.TEMPLATE_SET_COMPONENTS: {
            const { payload } = action;

            return {
                ...state,
                components: payload
            };
        }

        case type.TEMPLATE_SET_SUB_TEMPLATES: {
            const { payload } = action;

            return {
                ...state,
                subTemplates: payload
            };
        }

        case type.TEMPLATE_INIT: {
            const { payload } = action;
            return {
                ...initialState,
                templateID: payload.templateID,
                label: payload.label,
                labelFormat: payload.labelFormat,
                hasLabelFormat: payload.hasLabelFormat,
                isClassDescription: payload.isClassDescription,
                statements: payload.statements,
                predicate: payload.predicate,
                class: payload.class,
                components: payload.components,
                researchFields: payload.researchFields,
                researchProblems: payload.researchProblems,
                subTemplates: payload.subTemplates
            };
        }

        case type.IS_FETCHING_TEMPLATE: {
            return {
                ...state,
                isLoading: true
            };
        }

        case type.DONE_FETCHING_TEMPLATE: {
            return {
                ...state,
                isLoading: false
            };
        }

        case type.IS_SAVING_TEMPLATE: {
            return {
                ...state,
                isSaving: true
            };
        }

        case type.SAVE_TEMPLATE_DONE: {
            return {
                ...state,
                templateID: action.id,
                isSaving: false
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
