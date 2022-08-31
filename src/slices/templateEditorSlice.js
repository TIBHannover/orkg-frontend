import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'utils';
import { deleteStatementsByIds, createResourceStatement, getTemplateById, getTemplatesByClass } from 'services/backend/statements';
import { toast } from 'react-toastify';
import { uniqBy } from 'lodash';
import { getClasses, createClass } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createResource, updateResource } from 'services/backend/resources';
import { createObject } from 'services/backend/misc';
import { CLASSES, PREDICATES, ENTITIES } from 'constants/graphSettings';

const initialState = {
    label: '',
    editMode: false,
    researchFields: [],
    researchProblems: [],
    predicate: null,
    class: null,
    templateID: '',
    isStrict: false,
    hasLabelFormat: false,
    labelFormat: '',
    error: null,
    components: [],
    isLoading: false,
    statements: [],
    isSaving: false,
};

export const templateEditorSlice = createSlice({
    name: 'templateEditor',
    initialState,
    reducers: {
        updateLabel: (state, { payload }) => {
            state.label = payload;
        },
        updatePredicate: (state, { payload }) => {
            state.predicate = payload;
        },
        updateIsStrict: (state, { payload }) => {
            state.isStrict = payload;
        },
        updateHasLabelFormat: (state, { payload }) => {
            state.hasLabelFormat = payload;
        },
        updateLabelFormat: (state, { payload }) => {
            state.labelFormat = payload;
        },
        updateClass: (state, { payload }) => {
            state.class = payload;
        },
        updateResearchProblems: (state, { payload }) => {
            state.researchProblems = payload;
        },
        updateResearchFields: (state, { payload }) => {
            state.researchFields = payload;
        },
        setEditMode: (state, { payload }) => {
            state.editMode = payload;
        },
        updateComponents: (state, { payload }) => {
            state.components = payload;
        },
        initTemplate: (state, { payload }) => ({
            ...initialState,
            templateID: payload.templateID,
            created_by: payload.created_by,
            label: payload.label,
            labelFormat: payload.labelFormat,
            hasLabelFormat: payload.hasLabelFormat,
            isStrict: payload.isStrict,
            statements: payload.statements,
            predicate: payload.predicate,
            class: payload.class,
            components: payload.components,
            researchFields: payload.researchFields,
            researchProblems: payload.researchProblems,
        }),
        setIsLoading: (state, { payload }) => {
            state.isLoading = payload;
        },
        setHasFailed: (state, { payload }) => {
            state.hasFailed = payload;
        },
        setIsSaving: (state, { payload }) => {
            state.isSaving = payload;
        },
        setHasFailedSaving: (state, { payload }) => {
            state.hasFailedSaving = payload;
        },
        setTemplateId: (state, { payload }) => {
            state.templateID = payload;
        },
    },
    extraReducers: {
        [LOCATION_CHANGE]: () => initialState,
    },
});

export const {
    updateLabel,
    updatePredicate,
    updateIsStrict,
    updateHasLabelFormat,
    updateLabelFormat,
    updateClass,
    updateResearchProblems,
    updateResearchFields,
    setEditMode,
    updateComponents,
    initTemplate,
    setIsLoading,
    setHasFailed,
    setIsSaving,
    setHasFailedSaving,
    setTemplateId,
} = templateEditorSlice.actions;

export default templateEditorSlice.reducer;

export const loadTemplate = data => dispatch => {
    dispatch(setIsLoading(true));

    return getTemplateById(data).then(templateData => {
        dispatch(
            initTemplate({
                templateID: data,
                ...templateData,
            }),
        );
        dispatch(setIsLoading(false));
    });
};

export const saveTemplate = () => async (dispatch, getState) => {
    dispatch(setIsSaving(true));
    dispatch(setEditMode(false));
    const data = getState().templateEditor;

    if (!data.label) {
        // Make the template label mandatory
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        dispatch(setEditMode(true));
        toast.error('Please enter the name of template');
        return null;
    }

    if (data.class && data.class.id) {
        //  Check if the template of the class if already defined
        const templates = await getTemplatesByClass(data.class.id);
        if (templates.length > 0 && !templates.includes(data.templateID)) {
            dispatch(setHasFailedSaving(true));
            dispatch(setIsSaving(false));
            dispatch(setEditMode(true));
            toast.error('The template of this class is already defined');
            return null;
        }
    }
    try {
        const promises = [];
        let templateResource;
        if (!data.templateID) {
            templateResource = await createResource(data.label, [CLASSES.TEMPLATE]);
            templateResource = templateResource.id;
        } else {
            templateResource = data.templateID;
            await updateResource(templateResource, data.label);
        }

        if (data.isStrict) {
            // set the statement that says this is strict template
            const strictLiteral = await createLiteral('True');
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_STRICT, strictLiteral.id));
        }

        // save template class
        if (data.class && data.class.id) {
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_CLASS, data.class.id));
        } else {
            // Generate class for the template
            let templateClass = await getClasses({
                q: templateResource,
                exact: true,
            });
            if (templateClass && templateClass.totalElements === 1) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_CLASS, templateClass.content[0].id));
            } else {
                templateClass = await createClass(templateResource);
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_CLASS, templateClass.id));
            }
        }

        // We use reverse() to create statements to keep the order of elements inside the input field
        // save template predicate
        if (data.predicate && data.predicate.id) {
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_PREDICATE, data.predicate.id));
        }

        // save template research fields
        if (data.researchFields && data.researchFields.length > 0) {
            for (const researchField of data.researchFields.reverse()) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD, researchField.id));
            }
        }
        // save template research problems
        if (data.researchProblems && data.researchProblems.length > 0) {
            for (const researchProblem of data.researchProblems.reverse()) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM, researchProblem.id));
            }
        }

        // save template properties
        if (data.components && data.components.length > 0) {
            const componentsAPICalls = [];
            for (const [index, component] of uniqBy(data.components, 'property.id').entries()) {
                const componentObject = {
                    predicates: [],
                    resource: {
                        name: `Component for template ${templateResource}`,
                        classes: [CLASSES.TEMPLATE_COMPONENT],
                        values: {
                            [PREDICATES.TEMPLATE_COMPONENT_PROPERTY]: [
                                {
                                    '@id': component.property.id,
                                    '@type': ENTITIES.PREDICATE,
                                },
                            ],
                            ...(component.value &&
                                component.value.id && {
                                    [PREDICATES.TEMPLATE_COMPONENT_VALUE]: [
                                        {
                                            '@id': component.value.id,
                                            '@type': ENTITIES.CLASS,
                                        },
                                    ],
                                }),
                            ...((component.minOccurs || component.minOccurs === 0) && {
                                [PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MIN]: [
                                    {
                                        text: component.minOccurs,
                                        datatype: 'xsd:integer',
                                    },
                                ],
                            }),
                            ...((component.maxOccurs || component.maxOccurs === 0) && {
                                [PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MAX]: [
                                    {
                                        text: component.maxOccurs,
                                        datatype: 'xsd:integer',
                                    },
                                ],
                            }),
                            [PREDICATES.TEMPLATE_COMPONENT_ORDER]: [
                                {
                                    text: index,
                                    datatype: 'xsd:integer',
                                },
                            ],
                            ...(component.value &&
                                ['Number', 'Integer', 'String'].includes(component.value.id) &&
                                component.validationRules && {
                                    [PREDICATES.TEMPLATE_COMPONENT_VALIDATION_RULE]: Object.keys(component.validationRules)
                                        .filter(key => component.validationRules[key])
                                        .map(key => ({
                                            text: `${key}#${component.validationRules[key]}`,
                                            datatype: 'xsd:integer',
                                        })),
                                }),
                        },
                    },
                };
                // create the component using createObject endpoint
                componentsAPICalls.push(createObject(componentObject));
            }
            const components = await Promise.all(componentsAPICalls);
            // link components to the template
            components.map(c => promises.push(createResourceStatement(templateResource, PREDICATES.HAS_TEMPLATE_COMPONENT, c.id)));
        }

        // save Label Format
        if (data.hasLabelFormat && data.labelFormat) {
            const labelFormatLiteral = await createLiteral(data.labelFormat);
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_LABEL_FORMAT, labelFormatLiteral.id));
        }

        // delete all the statement old
        if (data.templateID) {
            if (data.statements.length > 0) {
                promises.push(deleteStatementsByIds(data.statements));
            }
        }

        return Promise.all(promises)
            .then(() => {
                if (data.templateID) {
                    toast.success('Template updated successfully');
                } else {
                    toast.success('Template created successfully');
                }

                dispatch(loadTemplate(templateResource)); // reload the template
                dispatch(setIsSaving(false));
                dispatch(setTemplateId(templateResource));
            })
            .catch(() => {
                dispatch(setHasFailedSaving(true));
                dispatch(setIsSaving(false));
                dispatch(setEditMode(true));
                toast.error('Template failed saving!');
            });
    } catch {
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        dispatch(setEditMode(true));
        toast.error('Template failed saving!');
        return Promise.reject();
    }
};
