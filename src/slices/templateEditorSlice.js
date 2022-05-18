import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'redux-first-history';
import { deleteStatementsByIds, createResourceStatement, getTemplateById, getTemplatesByClass } from 'services/backend/statements';
import { cloneDeep } from 'lodash';
import { toast } from 'react-toastify';
import { getClasses } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createClass } from 'services/backend/classes';
import { createResource, updateResource } from 'services/backend/resources';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

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
    isSaving: false
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
        initTemplate: (state, { payload }) => {
            return {
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
                researchProblems: payload.researchProblems
            };
        },
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
        }
    },
    extraReducers: {
        [LOCATION_CHANGE]: () => initialState
    }
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
    setTemplateId
} = templateEditorSlice.actions;

export default templateEditorSlice.reducer;

export const loadTemplate = data => dispatch => {
    dispatch(setIsLoading(true));

    return getTemplateById(data).then(templateData => {
        dispatch(
            initTemplate({
                templateID: data,
                ...templateData
            })
        );
        dispatch(setIsLoading(false));
    });
};

export const saveTemplate = templateData => {
    return async dispatch => {
        dispatch(setIsSaving(true));
        dispatch(setEditMode(false));
        const data = cloneDeep({ ...templateData });

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

        const promises = [];
        let templateResource;
        if (!data.templateID) {
            templateResource = await createResource(data.label, [CLASSES.TEMPLATE]);
            templateResource = templateResource.id;
        } else {
            templateResource = data.templateID;
            await updateResource(templateResource, data.label);
        }
        // delete all the statement
        if (data.templateID) {
            if (data.statements.length > 0) {
                await deleteStatementsByIds(data.statements);
            }
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
                exact: true
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
            for (const [index, property] of data.components.entries()) {
                const component = await createResource(`Component for template ${templateResource}`);
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_COMPONENT, component.id));
                promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_PROPERTY, property.property.id));
                if (property.value && property.value.id) {
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_VALUE, property.value.id));
                }
                // save Minimum Occurrence
                if (property.minOccurs || property.minOccurs === 0) {
                    const minimumLiteral = await createLiteral(property.minOccurs);
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MIN, minimumLiteral.id));
                }
                // save Maximum Occurrence
                if (property.maxOccurs || property.maxOccurs === 0) {
                    const maximumLiteral = await createLiteral(property.maxOccurs);
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MAX, maximumLiteral.id));
                }
                // save Order
                const orderLiteral = await createLiteral(index);
                promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_ORDER, orderLiteral.id));
                // save validation rules
                if (property.value && ['Number', 'Integer', 'String'].includes(property.value.id) && property.validationRules) {
                    for (const key in property.validationRules) {
                        if (property.validationRules.hasOwnProperty(key)) {
                            if (property.validationRules[key]) {
                                const ruleLiteral = await createLiteral(`${key}#${property.validationRules[key]}`);
                                promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_VALIDATION_RULE, ruleLiteral.id));
                            }
                        }
                    }
                }
            }
        }

        //save Label Format
        if (data.hasLabelFormat && data.labelFormat) {
            const labelFormatLiteral = await createLiteral(data.labelFormat);
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_LABEL_FORMAT, labelFormatLiteral.id));
        }

        Promise.all(promises)
            .then(() => {
                if (data.templateID) {
                    toast.success('Template updated successfully');
                } else {
                    toast.success('Template created successfully');
                }

                dispatch(loadTemplate(templateResource)); //reload the template
                dispatch(setIsSaving(false));
                dispatch(setTemplateId(templateResource));
            })
            .catch(() => {
                dispatch(setHasFailedSaving(true));
                dispatch(setIsSaving(false));
                dispatch(setEditMode(true));
                toast.error('Template failed saving!');
            });
    };
};
