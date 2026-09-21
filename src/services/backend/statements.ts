import { StatementsApi, StatementsApiFindAllRequest, SubgraphsApi, UpdateStatementRequest } from '@orkg/orkg-client';

import { CLASSES, PREDICATES, RESOURCES } from '@/constants/graphSettings';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, FORMATTED_LABELS_ACCEPT, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { getTemplate } from '@/services/backend/templates';
import { ExtractionMethod, Pagination, PropertyShapeResourceType, Resource, Statement, WithPaginationParams } from '@/services/backend/types';

export const statementsUrl = `${urlNoTrailingSlash}/statements`;

const statementsApi = new StatementsApi(configuration);
const subgraphsApi = new SubgraphsApi(configuration);

export const getStatement = (id: string) => statementsApi.findById({ id });

export type GetStatementsParams<T extends boolean = true> = Omit<WithPaginationParams<StatementsApiFindAllRequest>, 'accept'> & {
    returnFormattedLabels?: boolean;
    returnContent?: T;
};

export const getStatements = <T extends boolean = true>({
    returnContent = true as T,
    returnFormattedLabels = false,
    ...params
}: GetStatementsParams<T>): Promise<T extends true ? Statement[] : Pagination<Statement>> =>
    statementsApi
        .findAll(
            transformPaginationParams({
                ...params,
                accept: returnFormattedLabels ? FORMATTED_LABELS_ACCEPT : undefined,
            }),
        )
        .then((res) => (returnContent ? res.content : res)) as Promise<T extends true ? Statement[] : Pagination<Statement>>;

export const createStatement = (subjectId: string, predicateId: string, objectId: string) =>
    statementsApi.createRaw({ createStatementRequest: { subjectId, predicateId, objectId } }).then(getCreatedId);

export const createResourceStatement = (subjectId: string, predicateId: string, objectId: string) =>
    createStatement(subjectId, predicateId, objectId);

export const createLiteralStatement = (subjectId: string, predicateId: string, literalId: string) =>
    createStatement(subjectId, predicateId, literalId);

export const updateStatement = (id: string, data: UpdateStatementRequest) => statementsApi.update({ id, updateStatementRequest: data });

export const setStatementsExtractionMethod = (statementIds: string[], extractionMethod: ExtractionMethod) =>
    Promise.all(statementIds.map((id) => updateStatement(id, { extractionMethod })));

export const deleteStatementById = (id: string) => statementsApi.deleteById({ id });

/**
 * Fetching the sub-graph starting from a certain Thing in the KG.
 *
 * GET /statements/{id}/bundle is deprecated; the subgraph endpoint is its successor, and the
 * result is adapted to the bundle shape ({ root, statements }) its consumer still expects.
 *
 * @param {String} id - Thing id
 * @param {String} maxLevel - The number of levels in the graph to fetch
 * @param {Array} blacklist - List of classes ids to ignore while parsing the graph
 * @return {Promise} Promise object
 */
export const getStatementsBundleBySubject = ({ id, maxLevel = 10, blacklist = [] }: { id: string; maxLevel?: number; blacklist?: string[] }) =>
    subgraphsApi.findByRootId({ id, maxHops: maxLevel, denyClasses: blacklist, size: 9999 }).then((page) => ({ root: id, statements: page.content }));

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
            extractionMethod: 'UNKNOWN',
            _class: 'resource',
            createdAt: '',
            createdBy: '',
            observatoryId: '',
            organizationId: '',
            formattedLabel: '',
            modifiable: true,
            visibility: 'DEFAULT',
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
                .filter((statement: Statement) => statement.subject._class === 'resource' && statement.subject.classes?.includes(CLASSES.NODE_SHAPE))
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
                // the generated client escapes the wire field 'class' as '_class'
                .filter((ps) => ps.type === 'resource' && ps._class !== undefined)
                .map((ps) =>
                    getTemplatesByClass((ps as PropertyShapeResourceType)._class?.id ?? '').then((templateIds) => {
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
