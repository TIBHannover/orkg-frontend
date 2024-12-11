import { Cite } from '@citation-js/core';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import THING_TYPES from 'constants/thingTypes';
import { countBy, orderBy } from 'lodash';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getResource } from 'services/backend/resources';
import { getStatementsBundleBySubject, getStatementsBySubjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { getThing } from 'services/simcomp';
import { load as loadArticle } from 'slices/reviewSlice';
import { filterObjectOfStatementsByPredicateAndClass, getAuthorsInList } from 'utils';

const useLoad = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const dispatch = useDispatch();

    const notFound = () => {
        setIsNotFound(true);
        setIsLoading(false);
    };

    const failed = () => {
        setHasFailed(true);
        setIsLoading(false);
    };

    const getVersions = async (paperId) => {
        const statements = await getStatementsBySubjectAndPredicate({ subjectId: paperId, predicateId: PREDICATES.HAS_PUBLISHED_VERSION });
        const ids = statements.map((version) => version.object.id);

        if (ids.length === 0) {
            return [];
        }
        const versionsStatements = await getStatementsBySubjects({ ids });

        return versionsStatements
            .map((versionSubject) => ({
                ...versionSubject.statements.find(
                    (statement) =>
                        statement.subject.classes.includes(CLASSES.SMART_REVIEW_PUBLISHED) && statement.predicate.id === PREDICATES.DESCRIPTION,
                ),
            }))
            .map((statement) => ({
                id: statement.subject.id,
                date: statement.subject.created_at,
                description: statement.object.label,
                creator: statement.object.created_by,
            }));
    };

    const getObjectsByPredicateAndSubject = (statements, predicateId, subjectId) =>
        statements
            .filter((statement) => statement.predicate.id === predicateId && statement.subject.id === subjectId)
            .map((statement) => statement.object);

    const getStatementsBySubjectId = (statements, subjectId) => statements.filter((statement) => statement.subject.id === subjectId);

    const getStatementsByPredicateAndSubject = (statements, predicateId, subjectId) =>
        statements.filter((statement) => statement.subject.id === subjectId && statement.predicate.id === predicateId);

    const getAllContributors = (statements) => {
        if (statements.length === 0) {
            return [];
        }
        const contributors = statements
            .flatMap((statement) => [statement.subject.created_by, statement.object.created_by, statement.created_by])
            .filter((contributor) => contributor !== MISC.UNKNOWN_ID);

        const statementAmountPerContributor = countBy(contributors);
        const contributorsWithPercentage = Object.keys(statementAmountPerContributor).map((contributorId) => ({
            id: contributorId,
            percentage: Math.round((statementAmountPerContributor[contributorId] / contributors.length) * 100),
        }));

        return orderBy(contributorsWithPercentage, 'percentage', 'desc');
    };

    const getReferences = async (statements, contributionId) => {
        const referenceStatements = statements.filter(
            (statement) => statement.subject.id === contributionId && statement.predicate.id === PREDICATES.HAS_REFERENCE,
        );
        const parseReferences = referenceStatements.map((reference) => Cite.async(reference.object.label).catch((e) => console.error(e)));

        return (await Promise.all(parseReferences)).map((parsedReference, index) => ({
            parsedReference: parsedReference?.data?.[0] ?? {},
            literal: referenceStatements[index].object,
            statementId: referenceStatements[index].id,
        }));
    };

    const getArticleById = useCallback(async (id) => {
        let paperResource = await getResource(id).catch(() => {});
        let isPublished = false;
        let articleResource = null;
        if (!paperResource) {
            notFound();
            return null;
        }

        let paperStatements = [];
        const paramId = id;

        // for published articles
        if (paperResource.classes.includes(CLASSES.SMART_REVIEW_PUBLISHED)) {
            const resourceData = await getThing({ thingType: THING_TYPES.REVIEW, thingKey: id }).catch((e) => {});
            if (!resourceData) {
                console.error('no resource data found');
                notFound();
                return null;
            }
            const {
                data: { rootResource, statements },
            } = resourceData;
            paperStatements = statements;
            id = rootResource;
            articleResource = paperResource;
            paperResource = statements.find((statement) => statement.subject.id === id).subject;
            isPublished = true;
        } else {
            try {
                const { statements } = await getStatementsBundleBySubject({
                    id,
                });
                paperStatements = statements;
            } catch (e) {
                console.error('error while bundle fetching statements', e);
                failed();
                return null;
            }
        }

        // get all published versions for this article
        const versions = await getVersions(paperResource.id);

        const doiStatements = await getStatementsBySubjectAndPredicate({ subjectId: paramId, predicateId: PREDICATES.HAS_DOI });
        const doi = doiStatements?.[0]?.object?.label ?? null;
        const contributionResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_CONTRIBUTION, id);

        if (contributionResources.length === 0) {
            console.error('no contributions found');
            notFound();
            return null;
        }

        const contributionResource = contributionResources.find((statement) => statement.classes.includes(CLASSES.CONTRIBUTION_SMART_REVIEW));

        if (!contributionResource) {
            console.error('no contribution with class "CONTRIBUTION_REVIEW" found');
            notFound();
            return null;
        }

        // get the research field
        let researchField = null;
        const researchFieldStatement = paperStatements.find(
            (statement) => statement.subject.id === id && statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD,
        );
        if (researchFieldStatement) {
            researchField = {
                id: researchFieldStatement.object.id,
                label: researchFieldStatement.object.label,
                statementId: researchFieldStatement.id,
            };
        }

        const sectionResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_SECTION, contributionResource.id);
        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
            sectionResources[index].statements = sectionStatements;
        }

        // legacy code check for when authors were still stored without lists, using PREDICATES.HAS_AUTHOR directly
        const authorStatements = getStatementsByPredicateAndSubject(paperStatements, PREDICATES.HAS_AUTHOR, id);

        let authorResources = [];
        let authorListResource = {};

        if (authorStatements.length === 0) {
            authorResources = getAuthorsInList({ resourceId: paperResource.id, statements: paperStatements });
            authorListResource = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHORS, false)?.[0];
        } else {
            // legacy author code
            for (const author of authorStatements) {
                const orcidStatements = getStatementsBySubjectId(paperStatements, author.id);
                let orcid = null;
                if (orcidStatements.length) {
                    const orcidStatement = orcidStatements.find((statement) => statement.predicate.id === PREDICATES.HAS_ORCID);
                    orcid = orcidStatement ? orcidStatement.object.label : '';
                }
                authorResources.push({
                    ...author.object,
                    statementId: author.id,
                    orcid: orcid || undefined,
                });
            }
            authorResources = authorResources.reverse();
            // end legacy code
        }

        const sections = [];
        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
            sectionResources[index].statements = sectionStatements;
            const type = section.classes.length > 1 ? section.classes.find((_class) => _class !== CLASSES.SECTION) : section.classes[0];
            let markdown = null;
            let contentLink = null;
            let dataTable = null;

            if ([CLASSES.RESOURCE_SECTION, CLASSES.PROPERTY_SECTION, CLASSES.COMPARISON_SECTION, CLASSES.VISUALIZATION_SECTION].includes(type)) {
                const linkStatement = section.statements.find((statement) => statement.predicate.id === PREDICATES.HAS_LINK);
                const link = linkStatement?.object;

                contentLink = {
                    id: section?.id,
                    objectId: link?.id,
                    label: link?.label,
                };
            } else if (type === CLASSES.ONTOLOGY_SECTION) {
                const properties =
                    section.statements
                        .filter((statement) => statement.predicate.id === PREDICATES.SHOW_PROPERTY)
                        .map((statement) => statement.object)
                        .reverse() ?? [];

                const entities =
                    section.statements
                        .filter((statement) => statement.predicate.id === PREDICATES.HAS_ENTITY)
                        .map((statement) => statement.object)
                        .reverse() ?? [];

                const entityStatements = entities.flatMap((entity) => ({
                    ...entity,
                    statements: paperStatements.filter((statement) => statement.subject.id === entity.id),
                }));

                dataTable = {
                    properties,
                    entities: entityStatements,
                };
            } else {
                const contentStatement = section.statements.find((statement) => statement.predicate.id === PREDICATES.HAS_CONTENT);
                const content = contentStatement?.object;
                markdown = {
                    id: content?.id,
                    label: content?.label,
                };
            }

            sections.push({
                id: section.id,
                title: {
                    id: section.id,
                    label: section.label,
                },
                type: {
                    id: type,
                },
                markdown,
                contentLink,
                dataTable,
            });
        }

        // contributors
        const contributors = getAllContributors(paperStatements);
        const references = await getReferences(paperStatements, contributionResource.id);

        const sdgs = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.SUSTAINABLE_DEVELOPMENT_GOAL, id).map((sdgResource) => ({
            id: sdgResource.id,
            label: sdgResource.label,
        }));

        return {
            articleId: paramId,
            articleResource: articleResource ?? null,
            paper: {
                id: paperResource.id,
                title: paperResource.label,
            },
            contributionId: contributionResource.id,
            authorResources,
            authorListResource,
            sections: sections.reverse(),
            isPublished,
            versions,
            researchField,
            statements: paperStatements,
            contributors,
            references,
            doi,
            sdgs,
        };
    }, []);

    const load = useCallback(
        async (id) => {
            setIsLoading(true);
            const article = await getArticleById(id);
            if (article) {
                dispatch(loadArticle(article));
            }
            setIsLoading(false);
        },
        [dispatch, getArticleById],
    );

    return { load, isLoading, isNotFound, getArticleById, getVersions, hasFailed };
};

export default useLoad;
