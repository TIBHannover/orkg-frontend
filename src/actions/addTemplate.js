import * as type from './types.js';
import { createResource, updateResource, deleteStatementsByIds, createResourceStatement, getTemplateById, createLiteral } from 'network';
import { toast } from 'react-toastify';

export const setEditMode = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_EDIT_MODE,
        payload: data
    });
};

export const setLabel = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_LABEL,
        payload: data
    });
};

export const setIsClassDescription = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_IS_CLASS_DESCRIPTION,
        payload: data
    });
};

export const setHasLabelFormat = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_HAS_LABEL_FORMAT,
        payload: data
    });
};

export const setLabelFormat = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_LABEL_FORMAT,
        payload: data
    });
};

export const setPredicate = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_PREDICATE,
        payload: data
    });
};

export const setClass = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_CLASS,
        payload: data
    });
};

export const setResearchProblems = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_RESEARCH_PROBLEMS,
        payload: data
    });
};

export const setResearchFields = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_RESEARCH_FIELDS,
        payload: data
    });
};

export const setComponents = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_COMPONENTS,
        payload: data
    });
};

export const setSubTemplates = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_SUB_TEMPLATES,
        payload: data
    });
};

export const setIsLoading = () => dispatch => {
    dispatch({
        type: type.IS_FETCHING_TEMPLATE
    });
};

export const doneLoading = () => dispatch => {
    dispatch({
        type: type.DONE_FETCHING_TEMPLATE
    });
};

export const loadTemplate = data => dispatch => {
    dispatch({
        type: type.IS_FETCHING_TEMPLATE
    });

    return getTemplateById(data).then(templateData => {
        dispatch({
            type: type.TEMPLATE_INIT,
            payload: {
                templateID: data,
                ...templateData
            }
        });
        dispatch({
            type: type.DONE_FETCHING_TEMPLATE
        });
    });
};

export const saveTemplate = data => {
    return async dispatch => {
        dispatch({
            type: type.IS_SAVING_TEMPLATE
        });
        dispatch(setEditMode(false));
        const promises = [];
        let templateResource;
        if (!data.templateID) {
            templateResource = await createResource(data.label, [process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE]);
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
        if (data.isClassDescription) {
            // save template class
            if (data.class && data.class.id) {
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_OF_CLASS, data.class.id));
            }
        } else {
            // We use reverse() to create statements to keep the order of elements inside the input field
            // save template predicate
            if (data.predicate && data.predicate.id) {
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_OF_PREDICATE, data.predicate.id));
            }

            // save template research fields
            if (data.researchFields && data.researchFields.length > 0) {
                for (const researchField of data.researchFields.reverse()) {
                    promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD, researchField.id));
                }
            }
            // save template research problems
            if (data.researchProblems && data.researchProblems.length > 0) {
                for (const researchProblem of data.researchProblems.reverse()) {
                    promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM, researchProblem.id));
                }
            }
        }

        // save template properties
        if (data.components && data.components.length > 0) {
            for (const property of data.components.filter(tp => tp.property.id).reverse()) {
                const component = await createResource(`Component for template ${templateResource}`);
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_COMPONENT, component.id));
                promises.push(createResourceStatement(component.id, process.env.REACT_APP_TEMPLATE_COMPONENT_PROPERTY, property.property.id));
                if (property.value && property.value.id) {
                    promises.push(createResourceStatement(component.id, process.env.REACT_APP_TEMPLATE_COMPONENT_VALUE, property.value.id));
                }
                // save validation rules
                if (property.value && ['Number', 'String'].includes(property.value.id) && property.validationRules) {
                    for (const key in property.validationRules) {
                        if (property.validationRules.hasOwnProperty(key)) {
                            if (property.validationRules[key]) {
                                const ruleLiteral = await createLiteral(`${key}#${property.validationRules[key]}`);
                                promises.push(
                                    createResourceStatement(component.id, process.env.REACT_APP_TEMPLATE_COMPONENT_VALIDATION_RULE, ruleLiteral.id)
                                );
                            }
                        }
                    }
                    promises.push(createResourceStatement(component.id, process.env.REACT_APP_TEMPLATE_COMPONENT_VALUE, property.value.id));
                }
            }
        }

        //save Label Format
        if (data.hasLabelFormat) {
            const labelFormatLiteral = await createLiteral(data.labelFormat);
            promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_LABEL_FORMAT, labelFormatLiteral.id));
        }

        // save template sub templates
        if (data.subTemplates && data.subTemplates.length > 0) {
            for (const subtemplate of data.subTemplates.filter(st => st.id).reverse()) {
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_SUB_TEMPLATE, subtemplate.id));
            }
        }

        Promise.all(promises).then(() => {
            if (data.templateID) {
                toast.success('Contribution Template updated successfully');
            } else {
                toast.success('Contribution Template created successfully');
            }

            dispatch(loadTemplate(templateResource)); //reload the template

            dispatch({
                type: type.SAVE_TEMPLATE_DONE,
                id: templateResource
            });
        });
    };
};
