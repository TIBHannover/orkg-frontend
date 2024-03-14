import { createSlice } from '@reduxjs/toolkit';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { uniqBy } from 'lodash';
import { match } from 'path-to-regexp';
import { toast } from 'react-toastify';
import { createClass, getClasses } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createObject } from 'services/backend/misc';
import { updateResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementsByIds,
    getTemplateById,
    getTemplatesByClass,
} from 'services/backend/statements';
import { LOCATION_CHANGE } from 'utils';

const initialState = {
    label: '',
    description: '',
    created_by: null,
    created_at: null,
    diagramMode: false,
    researchFields: [],
    researchProblems: [],
    predicate: null,
    class: null,
    templateID: '',
    isClosed: false,
    hasLabelFormat: false,
    labelFormat: '',
    error: null,
    propertyShapes: [],
    isLoading: false,
    failureStatus: '',
    hasFailed: false,
    statements: [],
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
            state.predicate = payload;
        },
        updateIsClosed: (state, { payload }) => {
            state.isClosed = payload;
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
        setDiagramMode: (state, { payload }) => {
            state.diagramMode = payload;
        },
        updatePropertyShapes: (state, { payload }) => {
            state.propertyShapes = payload;
        },
        initTemplate: (state, { payload }) => ({
            ...initialState,
            templateID: payload.templateID,
            created_by: payload.created_by,
            created_at: payload.created_at,
            label: payload.label,
            description: payload.description,
            labelFormat: payload.labelFormat,
            hasLabelFormat: payload.hasLabelFormat,
            isClosed: payload.isClosed,
            statements: payload.statements,
            predicate: payload.predicate,
            class: payload.class,
            propertyShapes: payload.propertyShapes,
            researchFields: payload.researchFields,
            researchProblems: payload.researchProblems,
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
        setTemplateId: (state, { payload }) => {
            state.templateID = payload;
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
            if (
                (parsedPayloadTabs && parsedPayloadTabs.params?.id === state.templateID) ||
                (parsedPayload && parsedPayload.params?.id === state.templateID)
            ) {
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
    updateClass,
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
    setTemplateId,
    setTemplateFlow,
} = templateEditorSlice.actions;

export default templateEditorSlice.reducer;

export const loadTemplate = (data) => (dispatch) => {
    dispatch(setIsLoading(true));

    return getTemplateById(data)
        .then((templateData) => {
            dispatch(
                initTemplate({
                    templateID: data,
                    ...templateData,
                }),
            );
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

    if (data.class && data.class.id) {
        //  Check if the template of the class if already defined
        const templates = await getTemplatesByClass(data.class.id);
        if (templates.length > 0 && !templates.includes(data.templateID)) {
            dispatch(setHasFailedSaving(true));
            dispatch(setIsSaving(false));
            toast.error('The template of this class is already defined');
            return null;
        }
    }
    try {
        const promises = [];

        const templateResource = data.templateID;
        await updateResource(templateResource, data.label);

        if (data.isClosed) {
            // set the statement that says this is strict template
            const strictLiteral = await createLiteral('true', 'xsd:boolean');
            promises.push(createResourceStatement(templateResource, PREDICATES.SHACL_CLOSED, strictLiteral.id));
        }

        // save template class
        if (data.class && data.class.id) {
            promises.push(createResourceStatement(templateResource, PREDICATES.SHACL_TARGET_CLASS, data.class.id));
        } else {
            // Generate class for the template
            let templateClass = await getClasses({
                q: templateResource,
                exact: true,
            });
            if (templateClass && templateClass.totalElements === 1) {
                promises.push(createResourceStatement(templateResource, PREDICATES.SHACL_TARGET_CLASS, templateClass.content[0].id));
            } else {
                templateClass = await createClass(templateResource);
                promises.push(createResourceStatement(templateResource, PREDICATES.SHACL_TARGET_CLASS, templateClass.id));
            }
        }

        // save template description
        if (data.description) {
            const descriptionLiteral = await createLiteral(data.description);
            promises.push(createLiteralStatement(templateResource, PREDICATES.DESCRIPTION, descriptionLiteral.id));
        }

        // save template predicate
        if (data.predicate && data.predicate.id) {
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_PREDICATE, data.predicate.id));
        }

        // We use reverse() to create statements to keep the order of elements inside the input field
        // save template research fields
        if (data.researchFields && data.researchFields.length > 0) {
            for (const researchField of [...data.researchFields].reverse()) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD, researchField.id));
            }
        }
        // save template research problems
        if (data.researchProblems && data.researchProblems.length > 0) {
            for (const researchProblem of [...data.researchProblems].reverse()) {
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM, researchProblem.id));
            }
        }

        // save template properties
        if (data.propertyShapes && data.propertyShapes.length > 0) {
            const propertyShapesAPICalls = [];
            for (const [index, propertyShape] of uniqBy(data.propertyShapes, 'property.id').entries()) {
                const propertyShapeObject = {
                    predicates: [],
                    resource: {
                        name: `Property shape for ${templateResource}`,
                        classes: [CLASSES.PROPERTY_SHAPE],
                        values: {
                            [PREDICATES.SHACL_PATH]: [
                                {
                                    '@id': propertyShape.property.id,
                                },
                            ],
                            ...(propertyShape.value?.id && {
                                [['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(propertyShape.value.id)
                                    ? PREDICATES.SHACL_DATATYPE
                                    : PREDICATES.SHACL_CLASS]: [
                                    {
                                        '@id': propertyShape.value.id,
                                    },
                                ],
                            }),
                            ...((propertyShape.minCount || propertyShape.minCount === 0) && {
                                [PREDICATES.SHACL_MIN_COUNT]: [
                                    {
                                        text: propertyShape.minCount,
                                        datatype: 'xsd:integer',
                                    },
                                ],
                            }),
                            ...((propertyShape.maxCount || propertyShape.maxCount === 0) && {
                                [PREDICATES.SHACL_MAX_COUNT]: [
                                    {
                                        text: propertyShape.maxCount,
                                        datatype: 'xsd:integer',
                                    },
                                ],
                            }),
                            [PREDICATES.SHACL_ORDER]: [
                                {
                                    text: index,
                                    datatype: 'xsd:integer',
                                },
                            ],
                            ...(propertyShape.placeholder && {
                                [PREDICATES.PLACEHOLDER]: [
                                    {
                                        text: propertyShape.placeholder,
                                        datatype: 'xsd:string',
                                    },
                                ],
                            }),
                            ...(propertyShape.description && {
                                [PREDICATES.DESCRIPTION]: [
                                    {
                                        text: propertyShape.description,
                                        datatype: 'xsd:string',
                                    },
                                ],
                            }),
                            ...(['Decimal', 'Integer', 'String'].includes(propertyShape.value?.id)
                                ? {
                                      ...((propertyShape.minInclusive || propertyShape.minInclusive === 0) && {
                                          [PREDICATES.SHACL_MIN_INCLUSIVE]: [
                                              {
                                                  text: propertyShape.minInclusive,
                                                  datatype: 'xsd:integer',
                                              },
                                          ],
                                      }),
                                      ...((propertyShape.maxInclusive || propertyShape.maxInclusive === 0) && {
                                          [PREDICATES.SHACL_MAX_INCLUSIVE]: [
                                              {
                                                  text: propertyShape.maxInclusive,
                                                  datatype: 'xsd:integer',
                                              },
                                          ],
                                      }),
                                      ...((propertyShape.pattern || propertyShape.pattern === 0) && {
                                          [PREDICATES.SHACL_PATTERN]: [
                                              {
                                                  text: propertyShape.pattern,
                                                  datatype: 'xsd:string',
                                              },
                                          ],
                                      }),
                                  }
                                : {}),
                        },
                    },
                };
                // create the propertyShape using createObject endpoint
                propertyShapesAPICalls.push(createObject(propertyShapeObject));
            }
            const propertyShapes = await Promise.all(propertyShapesAPICalls);
            // link components to the template
            propertyShapes.map((c) => promises.push(createResourceStatement(templateResource, PREDICATES.SHACL_PROPERTY, c.id)));
        }

        // save Label Format
        if (data.hasLabelFormat && data.labelFormat) {
            const labelFormatLiteral = await createLiteral(data.labelFormat);
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_LABEL_FORMAT, labelFormatLiteral.id));
        }

        return Promise.all(promises)
            .then(async (responses) => {
                // delete all the statement old
                if (data.templateID) {
                    if (data.statements.length > 0) {
                        await deleteStatementsByIds(data.statements.filter((s) => !responses.map((r) => r.id).includes(s))); // filter on the newly created statements
                    }
                }
                if (data.templateID) {
                    toast.success('Template updated successfully');
                } else {
                    toast.success('Template created successfully');
                }
                dispatch(setIsSaving(false));
                toggleIsEditMode(false);
                dispatch(setTemplateId(templateResource));
                dispatch(loadTemplate(templateResource)); // reload the template
                return templateResource;
            })
            .catch(() => {
                dispatch(setHasFailedSaving(true));
                dispatch(setIsSaving(false));
                toggleIsEditMode(false);
                toast.error('Template failed saving!');
            });
    } catch {
        dispatch(setHasFailedSaving(true));
        dispatch(setIsSaving(false));
        toggleIsEditMode(false);
        toast.error('Template failed saving!');
        return Promise.reject();
    }
};
