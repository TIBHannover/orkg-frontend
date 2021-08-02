import * as type from './types.js';
import { deleteStatementsByIds, createResourceStatement, getTemplateById, getTemplatesByClass } from 'services/backend/statements';
import { getClasses } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createClass } from 'services/backend/classes';
import { createResource, updateResource } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

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

export const setIsStrictTemplate = data => dispatch => {
    dispatch({
        type: type.TEMPLATE_SET_IS_STRICT,
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

        if (!data.label) {
            // Make the template label mandatory
            dispatch({
                type: type.FAILURE_SAVING_TEMPLATE
            });
            toast.error('Please enter the name of template');
            return null;
        }

        if (data.class && data.class.id) {
            //  Check if the template of the class if already defined
            const templates = await getTemplatesByClass(data.class.id);
            if (templates.length > 0 && !templates.includes(data.templateID)) {
                dispatch({
                    type: type.FAILURE_SAVING_TEMPLATE
                });
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
                promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_OF_CLASS, templateClass[0].id));
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
                // save Minimum Occurence
                if (property.minOccurs || property.minOccurs === 0) {
                    const minimumLiteral = await createLiteral(property.minOccurs);
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MIN, minimumLiteral.id));
                }
                // save Maximum Occurence
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
                    promises.push(createResourceStatement(component.id, PREDICATES.TEMPLATE_COMPONENT_VALUE, property.value.id));
                }
            }
        }

        //save Label Format
        if (data.hasLabelFormat && data.labelFormat) {
            const labelFormatLiteral = await createLiteral(data.labelFormat);
            promises.push(createResourceStatement(templateResource, PREDICATES.TEMPLATE_LABEL_FORMAT, labelFormatLiteral.id));
        }

        Promise.all(promises).then(() => {
            if (data.templateID) {
                toast.success('Template updated successfully');
            } else {
                toast.success('Template created successfully');
            }

            dispatch(loadTemplate(templateResource)); //reload the template

            dispatch({
                type: type.SAVE_TEMPLATE_DONE,
                id: templateResource
            });
        });
    };
};
