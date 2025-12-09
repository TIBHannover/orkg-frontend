import qs from 'qs';

import { CLASSES, PREDICATES, RESOURCES } from '@/constants/graphSettings';
import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { getTemplate } from '@/services/backend/templates';
import { PaginatedResponse, PaginationParams, PropertyShapeResourceType, Resource, Statement } from '@/services/backend/types';

export const statementsUrl = `${url}statements/`;
export const statementsApi = backendApi.extend(() => ({ prefixUrl: statementsUrl }));

export const getStatement = (id: string) => statementsApi.get<Statement>(id).json();

export type GetStatementsParams<T extends boolean = true> = {
    subjectClasses?: string[];
    subjectId?: string;
    subjectLabel?: string;
    predicateId?: string;
    createdBy?: string;
    createdAtStart?: string;
    createdAtEnd?: string;
    objectClasses?: string[];
    objectId?: string;
    objectLabel?: string;
    returnFormattedLabels?: boolean;
    returnContent?: T;
} & PaginationParams;

export const getStatements = <T extends boolean = true>({
    subjectClasses = [],
    subjectId = undefined,
    subjectLabel = undefined,
    predicateId = undefined,
    createdBy = undefined,
    createdAtStart = undefined,
    createdAtEnd = undefined,
    objectClasses = [],
    objectId = undefined,
    objectLabel = undefined,
    page = 0,
    size = 9999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    returnContent = true as T,
    returnFormattedLabels = false,
}: GetStatementsParams<T>): Promise<T extends true ? Statement[] : PaginatedResponse<Statement>> => {
    let headers;
    if (returnFormattedLabels) {
        headers = {
            'Content-Type': 'application/json;charset=utf-8',
            Accept: 'application/json;formatted-labels=V1',
        };
    }
    const sort = sortBy.map(({ property, direction }) => `${property},${direction}`).join(',');
    const searchParams = qs.stringify(
        {
            subject_classes: subjectClasses.length > 0 ? subjectClasses.join(',') : undefined,
            subject_id: subjectId,
            subject_label: subjectLabel,
            predicate_id: predicateId,
            created_by: createdBy,
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
            object_classes: objectClasses.length > 0 ? objectClasses.join(',') : undefined,
            object_id: objectId,
            object_label: objectLabel,
            page,
            size,
            sort,
        },
        {
            skipNulls: true,
        },
    );

    return statementsApi
        .get<PaginatedResponse<Statement>>('', {
            searchParams,
            headers,
        })
        .json()
        .then((res) => (returnContent ? res.content : res)) as Promise<T extends true ? Statement[] : PaginatedResponse<Statement>>;
};

export const createStatement = (subjectId: string, predicateId: string, objectId: string) =>
    statementsApi
        .post<Statement>('', {
            json: {
                subject_id: subjectId,
                predicate_id: predicateId,
                object_id: objectId,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const createResourceStatement = (subjectId: string, predicateId: string, objectId: string) =>
    statementsApi
        .post<Statement>('', {
            json: {
                subject_id: subjectId,
                predicate_id: predicateId,
                object_id: objectId,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const createLiteralStatement = (subjectId: string, predicateId: string, literalId: string) =>
    statementsApi
        .post<Statement>('', {
            json: {
                subject_id: subjectId,
                predicate_id: predicateId,
                object_id: literalId,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const updateStatement = (
    id: string,
    {
        subject_id = null,
        predicate_id = null,
        object_id = null,
    }: { subject_id?: string | null; predicate_id?: string | null; object_id?: string | null },
) =>
    statementsApi
        .put<Statement>(id, {
            json: {
                ...(subject_id ? { subject_id } : null),
                ...(predicate_id ? { predicate_id } : null),
                ...(object_id ? { object_id } : null),
            },
        })
        .json();

export const deleteStatementById = (id: string) => statementsApi.delete<void>(encodeURIComponent(id)).json();

/**
 * Fetching statements for a thing as a bundle
 * A Bundle is a collection of statements that represents the sub-graph starting from a certain Thing in the KG.
 *
 * @param {String} id - Thing id
 * @param {String} maxLevel - The number of levels in the graph to fetch
 * @param {Array} blacklist - List of classes ids to ignore while parsing the graph
 * @return {Promise} Promise object
 */
export const getStatementsBundleBySubject = ({ id, maxLevel = 10, blacklist = [] }: { id: string; maxLevel?: number; blacklist?: string[] }) => {
    const searchParams = qs.stringify(
        { max_level: maxLevel, blacklist: blacklist?.join(',') },
        {
            skipNulls: true,
        },
    );
    return statementsApi
        .get<{
            root: string;
            statements: Statement[];
        }>(`${encodeURIComponent(id)}/bundle`, {
            searchParams,
        })
        .json();
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
    return getStatements({
        objectId: researchFieldId,
        predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD,
    }).then((parentResearchField) => {
        if (parentResearchField && Array.isArray(parentResearchField) && parentResearchField[0]) {
            parents.push(parentResearchField[0].object as Resource);
            if (parents.find((p) => p.id === parentResearchField[0].subject.id)) {
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
    return getStatements({
        objectId: researchProblemId,
        predicateId: PREDICATES.SUB_PROBLEM,
    }).then((parentResearchProblem) => {
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
    getStatements({
        objectId: classID,
        predicateId: PREDICATES.SHACL_TARGET_CLASS,
    })
        .then((statements) =>
            (statements as Statement[])
                .filter((statement: Statement) => statement.subject.classes?.includes(CLASSES.NODE_SHAPE))
                .map((st) => st.subject.id)
                .filter((c) => c),
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
        return getTemplate(id).then((t) => {
            const promises: Promise<any>[] = t.properties
                .filter((ps) => 'class' in ps && ps.class !== undefined)
                .map((ps) =>
                    getTemplatesByClass((ps as PropertyShapeResourceType).class?.id ?? '').then((templateIds) => {
                        if (templateIds.length) {
                            return loadTemplateFlowByID(templateIds[0], loadedNodes);
                        }
                        return Promise.resolve({});
                    }),
                );
            return Promise.all(promises).then((neighborNodes) => ({
                ...t,
                neighbors: neighborNodes,
            }));
        });
    }
    return Promise.resolve({});
};
