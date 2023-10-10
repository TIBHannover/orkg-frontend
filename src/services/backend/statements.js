import { CLASSES, PREDICATES, RESOURCES } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { flatten } from 'lodash';
import { submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { filterObjectOfStatementsByPredicateAndClass, filterStatementsBySubjectId, getPropertyShapeData, sortMethod } from 'utils';
import { getResource } from 'services/backend/resources';

export const statementsUrl = `${url}statements/`;

export const createResourceStatement = (subjectId, predicateId, objectId) =>
    submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: objectId,
        },
    );

export const createLiteralStatement = (subjectId, predicateId, literalId) =>
    submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: literalId,
        },
    );

export const updateStatement = (id, { subject_id = null, predicate_id = null, object_id = null }) =>
    submitPutRequest(
        `${statementsUrl}${id}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id } : null),
            ...(predicate_id ? { predicate_id } : null),
            ...(object_id ? { object_id } : null),
        },
    );

export const updateStatements = (statementIds, { subject_id = null, predicate_id = null, object_id = null }) =>
    submitPutRequest(
        `${statementsUrl}?ids=${statementIds.join()}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id } : null),
            ...(predicate_id ? { predicate_id } : null),
            ...(object_id ? { object_id } : null),
        },
    );

export const getAllStatements = ({ page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNull: true,
            skipEmptyString: true,
        },
    );

    return submitGetRequest(`${statementsUrl}?${params}`).then(res => res.content);
};

export const deleteStatementById = id => submitDeleteRequest(statementsUrl + encodeURIComponent(id));

export const deleteStatementsByIds = ids => submitDeleteRequest(`${statementsUrl}?ids=${ids.join()}`);

export const getStatementsBySubject = ({ id, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${statementsUrl}subject/${encodeURIComponent(id)}/?${params}`).then(res => res.content);
};

/**
 * Fetching statements for a thing as a bundle
 * A Bundle is a collection of statements that represents the sub-graph starting from a certain Thing in the KG.
 *
 * @param {String} id - Thing id
 * @param {String} maxLevel - The number of levels in the graph to fetch
 * @param {Array} blacklist - List of classes ids to ignore while parsing the graph
 * @return {Promise} Promise object
 */
export const getStatementsBundleBySubject = ({ id, maxLevel = 10, blacklist = [] }) => {
    const params = qs.stringify(
        { maxLevel, blacklist: blacklist?.join(',') },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${statementsUrl}${encodeURIComponent(id)}/bundle/?${params}`);
};

export const getStatementsBySubjects = ({ ids, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { ids: ids.join(), page, size, sort },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${statementsUrl}subjects/?${params}`).then(res =>
        res.map(subjectStatements => ({
            ...subjectStatements,
            statements: subjectStatements.statements.content,
        })),
    );
};

export const getStatementsByObject = async ({ id, page = 0, items: size = 9999, sortBy = 'created_at', desc = true, returnContent = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNulls: true,
        },
    );

    const statements = await submitGetRequest(`${statementsUrl}object/${encodeURIComponent(id)}/?${params}`).then(res =>
        returnContent ? res.content : res,
    );

    return statements;
};

export const getStatementsByPredicate = ({ id, page = 0, items: size = 9999, sortBy = 'created_at', desc = true, returnContent = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${statementsUrl}predicate/${encodeURIComponent(id)}/?${params}`).then(res => (returnContent ? res.content : res));
};

export const getStatementsBySubjectAndPredicate = ({ subjectId, predicateId, page = 0, items: size = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${statementsUrl}subject/${subjectId}/predicate/${predicateId}/?${params}`).then(res => res.content);
};

export const getStatementsByObjectAndPredicate = ({
    objectId,
    predicateId,
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    returnContent = true,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${statementsUrl}object/${objectId}/predicate/${predicateId}/?${params}`).then(res =>
        returnContent ? res.content : res,
    );
};

export const getStatementsByPredicateAndLiteral = ({
    literal,
    predicateId,
    subjectClass = null,
    items: size = 9999,
    page = 0,
    sortBy = 'created_at',
    desc = true,
    returnContent = true,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { size, subjectClass, page, sort, q: literal },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${statementsUrl}predicate/${predicateId}/literals/?${params}`).then(res => (returnContent ? res.content : res));
};

/**
 * Load template by ID
 *
 * @param {String} templateId Template Id
 */
export const getTemplateById = async templateId => {
    const subject = await getResource(templateId);
    const response = await getStatementsBundleBySubject({ id: templateId, maxLevel: 2, blacklist: [CLASSES.RESEARCH_FIELD] }).catch(() => null);
    if (!subject) {
        return Promise.reject(new Error('Template not found'));
    }
    const statements = filterStatementsBySubjectId(response.statements, templateId);
    const templatePredicate = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_OF_PREDICATE,
        true,
        null,
        templateId,
    );

    const targetClass = filterObjectOfStatementsByPredicateAndClass(response.statements, PREDICATES.SHACL_TARGET_CLASS, true, null, templateId);
    const templateFormatLabel = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_LABEL_FORMAT,
        true,
        null,
        templateId,
    );

    const descriptionLabel = filterObjectOfStatementsByPredicateAndClass(response.statements, PREDICATES.DESCRIPTION, true, null, templateId);

    const templateIsClosed = filterObjectOfStatementsByPredicateAndClass(response.statements, PREDICATES.SHACL_CLOSED, true, null, templateId);
    const templatePropertyShapes = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.SHACL_PROPERTY,
        false,
        null,
        templateId,
    );

    const researchFields = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_OF_RESEARCH_FIELD,
        false,
        null,
        templateId,
    );

    const researchProblems = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM,
        false,
        null,
        templateId,
    );

    const propertyShapes = templatePropertyShapes.map(propertyShape =>
        getPropertyShapeData(propertyShape, filterStatementsBySubjectId(response.statements, propertyShape.id)),
    );

    const propertyShapesStatements = templatePropertyShapes.map(propertyShape =>
        filterStatementsBySubjectId(response.statements, propertyShape.id).map(s => s.id),
    );

    return {
        id: templateId,
        ...subject,
        statements: [...statements.map(s => s.id), ...flatten(propertyShapesStatements)],
        predicate: templatePredicate,
        labelFormat: templateFormatLabel ? templateFormatLabel.label : '',
        description: descriptionLabel ? descriptionLabel.label : '',
        hasLabelFormat: !!templateFormatLabel,
        isClosed: templateIsClosed?.label === 'true' || templateIsClosed?.label === 'True',
        propertyShapes: propertyShapes?.length > 0 ? propertyShapes.sort((c1, c2) => sortMethod(c1.order, c2.order)) : [],
        class: targetClass
            ? {
                  id: targetClass.id,
                  label: targetClass.label,
                  uri: targetClass.uri,
              }
            : {},
        researchFields: researchFields.map(statement => ({
            id: statement.id,
            label: statement.label,
        })),
        researchProblems: researchProblems.map(statement => ({
            id: statement.id,
            label: statement.label,
        })),
    };
};

/**
 * Get Parents of research field
 *
 * @param {String} researchFieldId research field Id
 */
export const getParentResearchFields = (researchFieldId, parents = []) => {
    if (researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN) {
        parents.push({ id: researchFieldId, label: 'Research Field' });
        return Promise.resolve(parents);
    }
    return getStatementsByObjectAndPredicate({
        objectId: researchFieldId,
        predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD,
    }).then(parentResearchField => {
        if (parentResearchField && parentResearchField[0]) {
            parents.push(parentResearchField[0].object);
            if (parents.find(p => p.id === parentResearchField[0].subject.id)) {
                return Promise.resolve(parents);
            }
            return getParentResearchFields(parentResearchField[0].subject.id, parents);
        }
        return Promise.resolve(parents);
    });
};

/**
 * Get Parents of research problems
 *
 * @param {String} researchProblemId research problem Id
 */
export const getParentResearchProblems = (researchProblemId, parents = []) => {
    if (parents.length > 5) {
        return Promise.resolve(parents);
    }
    return getStatementsByObjectAndPredicate({
        objectId: researchProblemId,
        predicateId: PREDICATES.SUB_PROBLEM,
    }).then(parentResearchProblem => {
        if (parentResearchProblem && parentResearchProblem[0]) {
            if (parents.length === 0) {
                parents.push(parentResearchProblem[0].object);
            }
            parents.push(parentResearchProblem[0].subject);
            return getParentResearchProblems(parentResearchProblem[0].subject.id, parents);
        }
        return Promise.resolve(parents);
    });
};

/**
 * Get Template by Class
 *
 * @param {String} classID class ID
 */
export const getTemplatesByClass = classID =>
    getStatementsByObjectAndPredicate({
        objectId: classID,
        predicateId: PREDICATES.SHACL_TARGET_CLASS,
    })
        .then(statements =>
            statements
                .filter(statement => statement.subject.classes?.includes(CLASSES.NODE_SHAPE))
                .map(st => st.subject.id)
                .filter(c => c),
        )
        .catch(() => []);

/**
 * Load template flow by ID
 *
 * @param {String} id template ID
 * @param {Array} loadedNodes Set of templates {id: String, ...restOfProperties, neighbors}
 */
export const loadTemplateFlowByID = (id, loadedNodes) => {
    if (!loadedNodes.has(id)) {
        loadedNodes.add(id);
        return getTemplateById(id).then(t => {
            const promises = t.propertyShapes
                .filter(ps => ps.value)
                .map(ps =>
                    getTemplatesByClass(ps.value.id).then(templateIds => {
                        if (templateIds.length) {
                            return loadTemplateFlowByID(templateIds[0], loadedNodes);
                        }
                        return Promise.resolve([]);
                    }),
                );
            return Promise.all(promises).then(neighborNodes => ({
                ...t,
                neighbors: neighborNodes,
            }));
        });
    }
    return Promise.resolve([]);
};
