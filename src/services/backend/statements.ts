import { CLASSES, PREDICATES, RESOURCES } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { flatten } from 'lodash';
import { submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { getResource } from 'services/backend/resources';
import { PaginatedResponse, Resource, Statement } from 'services/backend/types';
import { filterObjectOfStatementsByPredicateAndClass, filterStatementsBySubjectId, getPropertyShapeData, sortMethod } from 'utils';

export const statementsUrl = `${url}statements/`;

export const createResourceStatement = (subjectId: string, predicateId: string, objectId: string): Promise<Statement> =>
    submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: objectId,
        },
    );

export const createLiteralStatement = (subjectId: string, predicateId: string, literalId: string): Promise<Statement> =>
    submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: literalId,
        },
    );

export const updateStatement = (
    id: string,
    {
        subject_id = null,
        predicate_id = null,
        object_id = null,
    }: { subject_id?: string | null; predicate_id?: string | null; object_id?: string | null },
): Promise<Statement> =>
    submitPutRequest(
        `${statementsUrl}${id}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id } : null),
            ...(predicate_id ? { predicate_id } : null),
            ...(object_id ? { object_id } : null),
        },
    );

export const updateStatements = (
    statementIds: string[],
    {
        subject_id = null,
        predicate_id = null,
        object_id = null,
    }: { subject_id?: string | null; predicate_id?: string | null; object_id?: string | null },
): Promise<Statement[]> =>
    submitPutRequest(
        `${statementsUrl}?ids=${statementIds.join()}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id } : null),
            ...(predicate_id ? { predicate_id } : null),
            ...(object_id ? { object_id } : null),
        },
    );

export const deleteStatementById = (id: string): Promise<null> => submitDeleteRequest(statementsUrl + encodeURIComponent(id));

export const deleteStatementsByIds = (ids: string[]): Promise<null> => submitDeleteRequest(`${statementsUrl}?ids=${ids.join()}`);

export const getStatementsBySubject = ({
    id,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
}: {
    id: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
}): Promise<Statement[]> => {
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
export const getStatementsBundleBySubject = ({
    id,
    maxLevel = 10,
    blacklist = [],
}: {
    id: string;
    maxLevel?: number;
    blacklist?: string[];
}): Promise<{
    root: string;
    statements: Statement[];
}> => {
    const params = qs.stringify(
        { maxLevel, blacklist: blacklist?.join(',') },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${statementsUrl}${encodeURIComponent(id)}/bundle/?${params}`);
};

export const getStatementsBySubjects = ({
    ids,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
}: {
    ids: string[];
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
}): Promise<{ id: string; statements: Statement[] }[]> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { ids: ids.join(), page, size, sort },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${statementsUrl}subjects/?${params}`).then((res: { id: string; statements: PaginatedResponse<Statement> }[]) =>
        res.map(subjectStatements => ({
            ...subjectStatements,
            statements: subjectStatements.statements.content,
        })),
    );
};

export const getStatementsByObject = async ({
    id,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    returnContent = true,
}: {
    id: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    returnContent?: boolean;
}): Promise<PaginatedResponse<Statement> | Statement[]> => {
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

export const getStatementsByPredicate = ({
    id,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    returnContent = true,
}: {
    id: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    returnContent?: boolean;
}): Promise<PaginatedResponse<Statement> | Statement[]> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${statementsUrl}predicate/${encodeURIComponent(id)}/?${params}`).then(res => (returnContent ? res.content : res));
};

export const getStatementsBySubjectAndPredicate = ({
    subjectId,
    predicateId,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
}: {
    subjectId: string;
    predicateId: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
}): Promise<Statement[]> => {
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
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    returnContent = true,
}: {
    objectId: string;
    predicateId: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    returnContent?: boolean;
}): Promise<PaginatedResponse<Statement> | Statement[]> => {
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
    size = 9999,
    page = 0,
    sortBy = 'created_at',
    desc = true,
    returnContent = true,
}: {
    literal: string;
    predicateId: string;
    subjectClass?: string | null;
    size?: number;
    page?: number;
    sortBy?: string;
    desc?: boolean;
    returnContent?: boolean;
}): Promise<PaginatedResponse<Statement> | Statement[]> => {
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
export const getTemplateById = async (templateId: string) => {
    const subject = await getResource(templateId);
    const response = await getStatementsBundleBySubject({ id: templateId, maxLevel: 2, blacklist: [CLASSES.RESEARCH_FIELD] }).catch(() => ({
        statements: [],
    }));
    if (!subject) {
        return Promise.reject(new Error('Template not found'));
    }
    // use @ts-ignore because of the filterObjectOfStatementsByPredicateAndClass is still in JS instead of TS
    const statements: Statement[] = filterStatementsBySubjectId(response.statements, templateId);
    const templatePredicate = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_OF_PREDICATE,
        true,
        // @ts-ignore
        null,
        templateId,
    );
    // @ts-ignore
    const targetClass = filterObjectOfStatementsByPredicateAndClass(response.statements, PREDICATES.SHACL_TARGET_CLASS, true, null, templateId);
    const templateFormatLabel = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_LABEL_FORMAT,
        true,
        // @ts-ignore
        null,
        templateId,
    );
    // @ts-ignore
    const descriptionLabel = filterObjectOfStatementsByPredicateAndClass(response.statements, PREDICATES.DESCRIPTION, true, null, templateId);
    // @ts-ignore
    const templateIsClosed = filterObjectOfStatementsByPredicateAndClass(response.statements, PREDICATES.SHACL_CLOSED, true, null, templateId);
    const templatePropertyShapes: Resource[] = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.SHACL_PROPERTY,
        false,
        // @ts-ignore
        null,
        templateId,
    );

    const researchFields: Resource[] = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_OF_RESEARCH_FIELD,
        false,
        // @ts-ignore
        null,
        templateId,
    );

    const researchProblems: Resource[] = filterObjectOfStatementsByPredicateAndClass(
        response.statements,
        PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM,
        false,
        // @ts-ignore
        null,
        templateId,
    );

    const propertyShapes = templatePropertyShapes.map(propertyShape =>
        getPropertyShapeData(propertyShape, filterStatementsBySubjectId(response.statements, propertyShape.id)),
    );

    const propertyShapesStatements = templatePropertyShapes.map(propertyShape =>
        // @ts-ignore
        filterStatementsBySubjectId(response.statements, propertyShape.id).map(s => s.id),
    );

    return {
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
export const getParentResearchFields = (researchFieldId: string, parents: Resource[] = []): Promise<Resource[]> => {
    if (researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN) {
        parents.push({
            id: researchFieldId,
            label: 'Research Field',
            classes: [],
            shared: 0,
            featured: false,
            unlisted: false,
            verified: false,
            extraction_method: 'UNKNOWN',
            _class: 'resource',
            created_at: '',
            created_by: '',
            observatory_id: '',
            organization_id: '',
            formatted_label: '',
        });
        return Promise.resolve(parents);
    }
    return getStatementsByObjectAndPredicate({
        objectId: researchFieldId,
        predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD,
    }).then(parentResearchField => {
        if (parentResearchField && Array.isArray(parentResearchField) && parentResearchField[0]) {
            parents.push(parentResearchField[0].object as Resource);
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
export const getParentResearchProblems = (researchProblemId: string, parents: Resource[] = []): Promise<Resource[]> => {
    if (parents.length > 5) {
        return Promise.resolve(parents);
    }
    return getStatementsByObjectAndPredicate({
        objectId: researchProblemId,
        predicateId: PREDICATES.SUB_PROBLEM,
    }).then(parentResearchProblem => {
        if (parentResearchProblem && Array.isArray(parentResearchProblem) && parentResearchProblem[0]) {
            if (parents.length === 0) {
                parents.push(parentResearchProblem[0].object as Resource);
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
export const getTemplatesByClass = (classID: string): Promise<string[]> =>
    getStatementsByObjectAndPredicate({
        objectId: classID,
        predicateId: PREDICATES.SHACL_TARGET_CLASS,
    })
        .then(statements =>
            (statements as Statement[])
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
 * @returns {Promise<object>} Promise resolving to a object containing loaded template flow
 */
export const loadTemplateFlowByID = (id: string, loadedNodes: Set<any>): Promise<object> => {
    if (!loadedNodes.has(id)) {
        loadedNodes.add(id);
        return getTemplateById(id).then(t => {
            const promises: Promise<any>[] = t.propertyShapes
                .filter(ps => ps.value)
                .map(ps =>
                    getTemplatesByClass(ps.value?.id).then(templateIds => {
                        if (templateIds.length) {
                            return loadTemplateFlowByID(templateIds[0], loadedNodes);
                        }
                        return Promise.resolve({});
                    }),
                );
            return Promise.all(promises).then(neighborNodes => ({
                ...t,
                neighbors: neighborNodes,
            }));
        });
    }
    return Promise.resolve({});
};
