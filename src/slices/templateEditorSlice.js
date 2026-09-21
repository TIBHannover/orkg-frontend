import { toast } from '@heroui/react';
import { createSlice } from '@reduxjs/toolkit';
import { match } from 'path-to-regexp';

import { LOCATION_CHANGE } from '@/components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import { CLASSES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { getStatusCode } from '@/services/backend/problemDetails';
import { getTemplatesByClass } from '@/services/backend/statements';
import { getTemplate, updateTemplate } from '@/services/backend/templates';

const initialState = {
    label: '',
    description: '',
    createdBy: null,
    createdAt: null,
    extractionMethod: 'UNKNOWN',
    observatories: [],
    organizations: [],
    diagramMode: false,
    relations: {
        researchFields: [],
        researchProblems: [],
    },
    targetClass: null,
    isClosed: false,
    hasLabelFormat: false,
    formattedLabel: '',
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
        updateIsClosed: (state, { payload }) => {
            state.isClosed = payload;
        },
        updateHasLabelFormat: (state, { payload }) => {
            state.hasLabelFormat = payload;
        },
        updateLabelFormat: (state, { payload }) => {
            state.formattedLabel = payload;
        },
        updateTargetClass: (state, { payload }) => {
            state.targetClass = payload;
        },
        updateResearchProblems: (state, { payload }) => {
            state.relations.researchProblems = payload;
        },
        updateResearchFields: (state, { payload }) => {
            state.relations.researchFields = payload;
        },
        setDiagramMode: (state, { payload }) => {
            state.diagramMode = payload;
        },
        updatePropertyShapes: (state, { payload }) => {
            state.properties = payload;
        },
        updateProvenance: (state, { payload }) => {
            state.observatories = payload.observatory_id && payload.observatory_id !== MISC.UNKNOWN_ID ? [payload.observatory_id] : [];
            state.organizations = payload.organization_id && payload.organization_id !== MISC.UNKNOWN_ID ? [payload.organization_id] : [];
        },
        initTemplate: (state, { payload }) => ({
            ...initialState,
            hasLabelFormat: !!payload.formattedLabel,
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
    updateIsClosed,
    updateHasLabelFormat,
    updateLabelFormat,
    updateTargetClass,
    updateResearchProblems,
    updateResearchFields,
    setDiagramMode,
    updatePropertyShapes,
    updateProvenance,
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
            dispatch(setFailureStatus(getStatusCode(e)));
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
        toast.danger('Please enter the name of template');
        return null;
    }

    if (!data.targetClass) {
        // Make the template target class mandatory
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        toast.danger('Please select a target class');
        return null;
    }

    if (data.properties.length === 0) {
        // Make the template properties mandatory
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        toast.danger('Please add at least one property');
        return null;
    }

    if (data.targetClass && data.targetClass.id) {
        //  Check if the template of the class if already defined
        const templates = await getTemplatesByClass(data.targetClass.id);
        if (templates.length > 0 && !templates.includes(data.id)) {
            dispatch(setHasFailedSaving(true));
            dispatch(setIsSaving(false));
            toast.danger('The template of this class is already defined');
            return null;
        }
    }
    const dataToSubmit = {
        label: data.label,
        description: data.description ? data.description : null,
        formattedLabel: data.hasLabelFormat && data.formattedLabel ? data.formattedLabel : null,
        targetClass: data.targetClass.id,
        relations: {
            researchFields: data.relations.researchFields?.map((rf) => rf.id) || [],
            researchProblems: data.relations.researchProblems?.map((rf) => rf.id) || [],
        },
        properties: data.properties.map((ps) => ({
            label: ps.label || 'Property shape',
            placeholder: ps.placeholder,
            description: ps.description,
            minCount: ps.minCount,
            maxCount: ps.maxCount,
            path: ps.path.id,
            ...(ps.datatype?.id && { datatype: ps.datatype?.id }),
            ...(ps.datatype?.id === CLASSES.STRING && { pattern: ps.pattern }),
            ...([CLASSES.INTEGER, CLASSES.DECIMAL].includes(ps.datatype?.id) && { maxInclusive: ps.maxInclusive, minInclusive: ps.minInclusive }),
            // the generated client escapes the wire field 'class' as '_class'
            ...(ps._class?.id && { _class: ps._class?.id }),
        })),
        isClosed: data.isClosed,
    };
    try {
        await updateTemplate(data.id, dataToSubmit);
        toast.success('Template updated successfully');
        dispatch(loadTemplate(data.id)); // reload the template
    } catch (e) {
        dispatch(setHasFailedSaving(true));
        toggleIsEditMode(false);
        await errorHandler({ error: e, shouldShowToast: true });
    } finally {
        dispatch(setIsSaving(false));
        toggleIsEditMode(false);
    }

    return data.id;
};
