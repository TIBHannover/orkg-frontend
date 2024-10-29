import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { match } from 'path-to-regexp';
import { toast } from 'react-toastify';
import { getTemplatesByClass } from 'services/backend/statements';
import { getTemplate, updateTemplate } from 'services/backend/templates';

const initialState = {
    label: '',
    description: '',
    created_by: null,
    created_at: null,
    extraction_method: 'UNKNOWN',
    diagramMode: false,
    relations: {
        researchFields: [],
        researchProblems: [],
        predicate: null,
    },
    target_class: null,
    is_closed: false,
    hasLabelFormat: false,
    formatted_label: '',
    error: null,
    properties: [],
    isLoading: false,
    failureStatus: '',
    hasFailed: false,
    isSaving: false,
    templateFlow: null,
};

export const templateEditorSlice = createSlice({
    name: 'templateEditor',
    initialState,
    reducers: {
        updateLabel: (state, { payload }) => {
            state.label = payload;
        },
        updateDescription: (state, { payload }) => {
            state.description = payload;
        },
        updatePredicate: (state, { payload }) => {
            state.relations.predicate = payload;
        },
        updateIsClosed: (state, { payload }) => {
            state.is_closed = payload;
        },
        updateHasLabelFormat: (state, { payload }) => {
            state.hasLabelFormat = payload;
        },
        updateLabelFormat: (state, { payload }) => {
            state.formatted_label = payload;
        },
        updateTargetClass: (state, { payload }) => {
            state.target_class = payload;
        },
        updateResearchProblems: (state, { payload }) => {
            state.relations.research_problems = payload;
        },
        updateResearchFields: (state, { payload }) => {
            state.relations.research_fields = payload;
        },
        setDiagramMode: (state, { payload }) => {
            state.diagramMode = payload;
        },
        updatePropertyShapes: (state, { payload }) => {
            state.properties = payload;
        },
        initTemplate: (state, { payload }) => ({
            ...initialState,
            hasLabelFormat: !!payload.formatted_label,
            ...payload,
        }),
        setIsLoading: (state, { payload }) => {
            state.isLoading = payload;
        },
        setHasFailed: (state, { payload }) => {
            state.hasFailed = payload;
        },
        setFailureStatus: (state, { payload }) => {
            state.failureStatus = payload;
        },
        setIsSaving: (state, { payload }) => {
            state.isSaving = payload;
        },
        setHasFailedSaving: (state, { payload }) => {
            state.hasFailedSaving = payload;
        },
        setTemplateFlow: (state, { payload }) => {
            state.templateFlow = payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LOCATION_CHANGE, (state, { payload }) => {
            const matchTemplateTabs = match(ROUTES.TEMPLATE_TABS);
            const matchTemplate = match(ROUTES.TEMPLATE);
            const parsedPayloadTabs = matchTemplateTabs(payload.location.pathname);
            const parsedPayload = matchTemplate(payload.location.pathname);
            if ((parsedPayloadTabs && parsedPayloadTabs.params?.id === state.id) || (parsedPayload && parsedPayload.params?.id === state.id)) {
                // when it's the same template  (just the tab changed) do not init
                return state;
            }
            return initialState;
        });
    },
});

export const {
    updateLabel,
    updateDescription,
    updatePredicate,
    updateIsClosed,
    updateHasLabelFormat,
    updateLabelFormat,
    updateTargetClass,
    updateResearchProblems,
    updateResearchFields,
    setDiagramMode,
    updatePropertyShapes,
    initTemplate,
    setIsLoading,
    setFailureStatus,
    setHasFailed,
    setIsSaving,
    setHasFailedSaving,
    setTemplateFlow,
} = templateEditorSlice.actions;

export default templateEditorSlice.reducer;

export const loadTemplate = (data) => (dispatch) => {
    dispatch(setIsLoading(true));

    return getTemplate(data)
        .then((templateData) => {
            dispatch(initTemplate(templateData));
            dispatch(setIsLoading(false));
        })
        .catch((e) => {
            dispatch(setFailureStatus(e.statusCode));
            dispatch(setIsLoading(false));
            dispatch(setHasFailed(true));
        });
};

export const saveTemplate = (toggleIsEditMode) => async (dispatch, getState) => {
    dispatch(setIsSaving(true));
    const data = getState().templateEditor;

    if (!data.label) {
        // Make the template label mandatory
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        toast.error('Please enter the name of template');
        return null;
    }

    if (!data.target_class) {
        // Make the template target class mandatory
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        toast.error('Please select a target class');
        return null;
    }

    if (data.properties.length === 0) {
        // Make the template properties mandatory
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        toast.error('Please add at least one property');
        return null;
    }

    if (data.target_class && data.target_class.id) {
        //  Check if the template of the class if already defined
        const templates = await getTemplatesByClass(data.target_class.id);
        if (templates.length > 0 && !templates.includes(data.id)) {
            dispatch(setHasFailedSaving(true));
            dispatch(setIsSaving(false));
            toast.error('The template of this class is already defined');
            return null;
        }
    }
    const dataToSubmit = {
        label: data.label,
        description: data.description || null,
        formatted_label: data.hasLabelFormat && data.formatted_label ? data.formatted_label : null,
        target_class: data.target_class.id,
        relations: {
            research_fields: data.relations.research_fields?.map((rf) => rf.id) || [],
            research_problems: data.relations.research_problems?.map((rf) => rf.id) || [],
            predicate: data.relations.predicate?.id,
        },
        properties: data.properties.map((ps) => ({
            label: ps.label || 'Property shape',
            placeholder: ps.placeholder,
            description: ps.description,
            min_count: ps.min_count,
            max_count: ps.max_count,
            path: ps.path.id,
            ...(ps.datatype?.id && { datatype: ps.datatype?.id }),
            ...(ps.datatype?.id === CLASSES.STRING && { pattern: ps.pattern }),
            ...([CLASSES.INTEGER, CLASSES.DECIMAL].includes(ps.datatype?.id) && { max_inclusive: ps.max_inclusive, min_inclusive: ps.min_inclusive }),
            ...(ps.class?.id && { class: ps.class?.id }),
        })),
        is_closed: data.is_closed,
    };
    try {
        await updateTemplate(data.id, dataToSubmit);
        toast.success('Template updated successfully');
        dispatch(loadTemplate(data.id)); // reload the template
    } catch (e) {
        dispatch(setHasFailedSaving(true));
        toggleIsEditMode(false);
        toast.error('Template failed saving!');
    }
    dispatch(setIsSaving(false));
    toggleIsEditMode(false);

    return data.id;
};
