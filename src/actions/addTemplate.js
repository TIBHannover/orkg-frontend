import * as type from './types.js';
import {
    getStatementsBySubject,
    createResource,
    updateResource,
    deleteStatementsByIds,
    createResourceStatement,
    getStatementsBySubjects,
    getResource,
    createLiteral
} from 'network';
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

    return getResource(data).then(template =>
        getStatementsBySubject({ id: data }).then(templateStatements => {
            const templatePredicate = templateStatements.find(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_PREDICATE);
            const templateClass = templateStatements.find(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_CLASS);

            const templateComponents = templateStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT);

            const components = getStatementsBySubjects({ ids: templateComponents.map(property => property.object.id) }).then(componentsStatements => {
                return componentsStatements.map(componentStatements => {
                    const property = componentStatements.statements.find(
                        statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_PROPERTY
                    );
                    const value = componentStatements.statements.find(
                        statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_VALUE
                    );
                    const validationRules = componentStatements.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_VALIDATION_RULE
                    );

                    return {
                        id: componentStatements.id,
                        property: property
                            ? {
                                  id: property.object.id,
                                  label: property.object.label
                              }
                            : {},
                        value: value
                            ? {
                                  id: value.object.id,
                                  label: value.object.label
                              }
                            : {},
                        validationRules:
                            validationRules && Object.keys(validationRules).length > 0
                                ? validationRules.reduce((obj, item) => {
                                      const rule = item.object.label.split(/#(.+)/)[0];
                                      const value = item.object.label.split(/#(.+)/)[1];
                                      return Object.assign(obj, { [rule]: value });
                                  }, {})
                                : {}
                    };
                });
            });

            return Promise.all([components]).then(templateComponents => {
                dispatch({
                    type: type.TEMPLATE_INIT,
                    payload: {
                        templateID: data,
                        label: template.label,
                        statements: templateStatements.map(s => s.id),
                        predicate: templatePredicate
                            ? {
                                  id: templatePredicate.object.id,
                                  label: templatePredicate.object.label
                              }
                            : {},
                        components: templateComponents[0],
                        ...(templateClass
                            ? {
                                  isClassDescription: true,
                                  class: templateClass
                                      ? {
                                            id: templateClass.object.id,
                                            label: templateClass.object.label
                                        }
                                      : {}
                              }
                            : {
                                  isClassDescription: false,
                                  researchFields: templateStatements
                                      .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD)
                                      .map(statement => ({
                                          id: statement.object.id,
                                          label: statement.object.label
                                      })),
                                  researchProblems: templateStatements
                                      .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM)
                                      .map(statement => ({
                                          id: statement.object.id,
                                          label: statement.object.label
                                      })),
                                  subTemplates: templateStatements
                                      .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_SUB_TEMPLATE)
                                      .map(statement => ({
                                          id: statement.object.id,
                                          label: statement.object.label
                                      }))
                              })
                    }
                });
                dispatch({
                    type: type.DONE_FETCHING_TEMPLATE
                });
            });
        })
    );
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
