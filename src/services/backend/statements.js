import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitDeleteRequest, submitPutRequest } from 'network';
import queryString from 'query-string';
import { getResource } from 'services/backend/resources';
import { PREDICATES, MISC, CLASSES } from 'constants/graphSettings';
import { sortMethod } from 'utils';

export const statementsUrl = `${url}statements/`;

export const createResourceStatement = (subjectId, predicateId, objectId) => {
    return submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: objectId
        }
    );
};

export const createLiteralStatement = (subjectId, predicateId, literalId) => {
    return submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: literalId
        }
    );
};

export const updateStatement = (id, { subject_id = null, predicate_id = null, object_id = null }) => {
    return submitPutRequest(
        `${statementsUrl}${id}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id: subject_id } : null),
            ...(predicate_id ? { predicate_id: predicate_id } : null),
            ...(object_id ? { object_id: object_id } : null)
        }
    );
};

export const updateStatements = (statementIds, { subject_id = null, predicate_id = null, object_id = null }) => {
    return submitPutRequest(
        `${statementsUrl}?ids=${statementIds.join()}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id: subject_id } : null),
            ...(predicate_id ? { predicate_id: predicate_id } : null),
            ...(object_id ? { object_id: object_id } : null)
        }
    );
};

export const getAllStatements = ({ page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort });

    return submitGetRequest(`${statementsUrl}?${params}`).then(res => res.content);
};

export const deleteStatementById = id => {
    return submitDeleteRequest(statementsUrl + encodeURIComponent(id));
};

export const deleteStatementsByIds = ids => {
    return submitDeleteRequest(`${statementsUrl}?ids=${ids.join()}`);
};

export const getStatementsBySubject = ({ id, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort });

    return submitGetRequest(`${statementsUrl}subject/${encodeURIComponent(id)}/?${params}`).then(res => res.content);
};

export const getStatementsBySubjects = ({ ids, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ ids: ids.join(), page, size, sort });

    return submitGetRequest(`${statementsUrl}subjects/?${params}`).then(res =>
        res.map(subjectStatements => ({
            ...subjectStatements,
            statements: subjectStatements.statements.content
        }))
    );
};

export const getStatementsByObject = async ({ id, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort });

    const statements = await submitGetRequest(`${statementsUrl}object/${encodeURIComponent(id)}/?${params}`).then(res => res.content);

    return statements;
};

export const getStatementsByPredicate = ({ id, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort });

    return submitGetRequest(`${statementsUrl}predicate/${encodeURIComponent(id)}/?${params}`).then(res => res.content);
};

export const getStatementsBySubjectAndPredicate = ({ subjectId, predicateId, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort });

    return submitGetRequest(`${statementsUrl}subject/${subjectId}/predicate/${predicateId}/?${params}`).then(res => res.content);
};

export const getStatementsByObjectAndPredicate = ({ objectId, predicateId, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort });

    return submitGetRequest(`${statementsUrl}object/${objectId}/predicate/${predicateId}/?${params}`).then(res => res.content);
};

export const getStatementsByPredicateAndLiteral = ({ predicateId, literal, subjectClass = null, items: size = 9999 }) => {
    const params = queryString.stringify(
        { size, subjectClass: subjectClass },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${statementsUrl}predicate/${predicateId}/literal/${literal}/?${params}`).then(res => res.content);
};

/**
 * Load template by ID
 *
 * @param {String} templateId Template Id
 */
export const getTemplateById = templateId => {
    return getResource(templateId).then(template =>
        getStatementsBySubject({ id: templateId }).then(templateStatements => {
            const templatePredicate = templateStatements.find(statement => statement.predicate.id === PREDICATES.TEMPLATE_OF_PREDICATE);

            const templateClass = templateStatements.find(statement => statement.predicate.id === PREDICATES.TEMPLATE_OF_CLASS);

            const templateFormatLabel = templateStatements.find(statement => statement.predicate.id === PREDICATES.TEMPLATE_LABEL_FORMAT);

            const templateIsStrict = templateStatements.find(statement => statement.predicate.id === PREDICATES.TEMPLATE_STRICT);

            const templateComponents = templateStatements.filter(statement => statement.predicate.id === PREDICATES.TEMPLATE_COMPONENT);

            const components = getStatementsBySubjects({ ids: templateComponents.map(component => component.object.id) }).then(
                componentsStatements => {
                    return componentsStatements.map(componentStatements => {
                        const property = componentStatements.statements.find(
                            statement => statement.predicate.id === PREDICATES.TEMPLATE_COMPONENT_PROPERTY
                        );
                        const value = componentStatements.statements.find(
                            statement => statement.predicate.id === PREDICATES.TEMPLATE_COMPONENT_VALUE
                        );

                        const validationRules = componentStatements.statements.filter(
                            statement => statement.predicate.id === PREDICATES.TEMPLATE_COMPONENT_VALIDATION_RULE
                        );

                        const minOccurs = componentStatements.statements.find(
                            statement => statement.predicate.id === PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MIN
                        );

                        const maxOccurs = componentStatements.statements.find(
                            statement => statement.predicate.id === PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MAX
                        );

                        const order = componentStatements.statements.find(
                            statement => statement.predicate.id === PREDICATES.TEMPLATE_COMPONENT_ORDER
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
                            minOccurs: minOccurs ? minOccurs.object.label : 0,
                            maxOccurs: maxOccurs ? maxOccurs.object.label : null,
                            order: order ? order.object.label : null,
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
                }
            );

            return Promise.all([components]).then(templateComponents => ({
                id: templateId,
                label: template.label,
                statements: templateStatements.map(s => s.id),
                predicate: templatePredicate
                    ? {
                          id: templatePredicate.object.id,
                          label: templatePredicate.object.label
                      }
                    : null,
                labelFormat: templateFormatLabel ? templateFormatLabel.object.label : '',
                hasLabelFormat: templateFormatLabel ? true : false,
                isStrict: templateIsStrict ? true : false,
                components: templateComponents[0].sort((c1, c2) => sortMethod(c1.order, c2.order)),
                class: templateClass
                    ? {
                          id: templateClass.object.id,
                          label: templateClass.object.label
                      }
                    : {},
                researchFields: templateStatements
                    .filter(statement => statement.predicate.id === PREDICATES.TEMPLATE_OF_RESEARCH_FIELD)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    })),
                researchProblems: templateStatements
                    .filter(statement => statement.predicate.id === PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    }))
            }));
        })
    );
};

/**
 * Get Parents of research field
 *
 * @param {String} researchFieldId research field Id
 */
export const getParentResearchFields = (researchFieldId, parents = []) => {
    if (researchFieldId === MISC.RESEARCH_FIELD_MAIN) {
        parents.push({ id: researchFieldId, label: 'Research Field' });
        return Promise.resolve(parents);
    } else {
        return getStatementsByObjectAndPredicate({
            objectId: researchFieldId,
            predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD
        }).then(parentResearchField => {
            if (parentResearchField && parentResearchField[0]) {
                parents.push(parentResearchField[0].object);
                return getParentResearchFields(parentResearchField[0].subject.id, parents);
            } else {
                return Promise.resolve(parents);
            }
        });
    }
};

/**
 * Get Parents of research problems
 *
 * @param {String} researchProblemId research problem Id
 */
export const getParentResearchProblems = (researchProblemId, parents = []) => {
    if (parents.length > 5) {
        return Promise.resolve(parents);
    } else {
        return getStatementsByObjectAndPredicate({
            objectId: researchProblemId,
            predicateId: PREDICATES.SUB_PROBLEM
        }).then(parentResearchProblem => {
            if (parentResearchProblem && parentResearchProblem[0]) {
                if (parents.length === 0) {
                    parents.push(parentResearchProblem[0].object);
                }
                parents.push(parentResearchProblem[0].subject);
                return getParentResearchProblems(parentResearchProblem[0].subject.id, parents);
            } else {
                return Promise.resolve(parents);
            }
        });
    }
};

/**
 * Get Template by Class
 *
 * @param {String} classID class ID
 */
export const getTemplatesByClass = classID => {
    return getStatementsByObjectAndPredicate({
        objectId: classID,
        predicateId: PREDICATES.TEMPLATE_OF_CLASS
    }).then(statements =>
        Promise.all(statements.filter(statement => statement.subject.classes?.includes(CLASSES.CONTRIBUTION_TEMPLATE)).map(st => st.subject.id))
    );
};
