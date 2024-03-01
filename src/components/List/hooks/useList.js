import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import THING_TYPES from 'constants/thingTypes';
import { countBy, orderBy } from 'lodash';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createLiteral } from 'services/backend/literals';
import { createResource, getResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    getStatementsBundleBySubject,
    getStatementsBySubject,
    getStatementsBySubjectAndPredicate,
    getStatementsBySubjects,
} from 'services/backend/statements';
import { createThing, getThing } from 'services/similarity';
import { listLoaded, versionsSet } from 'slices/listSlice';
import { addAuthorsToStatements, filterObjectOfStatementsByPredicateAndClass, getAuthorsInList, getPaperData } from 'utils';

const useList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const dispatch = useDispatch();

    const getObjectsByPredicateAndSubject = (statements, predicateId, subjectId) =>
        statements
            .filter(statement => statement.predicate.id === predicateId && statement.subject.id === subjectId)
            .map(statement => statement.object);

    const getStatementsBySubjectId = (statements, subjectId) => statements.filter(statement => statement.subject.id === subjectId);

    const getStatementsByPredicateAndSubject = (statements, predicateId, subjectId) =>
        statements.filter(statement => statement.subject.id === subjectId && statement.predicate.id === predicateId);

    const notFound = () => {
        setIsNotFound(true);
        setIsLoading(false);
    };

    const getVersions = async listId => {
        const statements = await getStatementsBySubjectAndPredicate({ subjectId: listId, predicateId: PREDICATES.HAS_PUBLISHED_VERSION });
        const ids = statements.map(version => version.object.id);

        if (ids.length === 0) {
            return [];
        }
        const versionsStatements = await getStatementsBySubjects({ ids });

        return versionsStatements
            .map(versionSubject => ({
                ...versionSubject.statements.find(
                    statement =>
                        statement.subject.classes.includes(CLASSES.LITERATURE_LIST_PUBLISHED) && statement.predicate.id === PREDICATES.DESCRIPTION,
                ),
            }))
            .map(statement => ({
                id: statement.subject.id,
                date: statement.subject.created_at,
                description: statement.object.label,
                creator: statement.object.created_by,
            }));
    };

    const getAllContributors = statements => {
        if (statements.length === 0) {
            return [];
        }
        const contributors = statements
            .flatMap(statement => [statement.subject.created_by, statement.object.created_by, statement.created_by])
            .filter(contributor => contributor !== MISC.UNKNOWN_ID);

        const statementAmountPerContributor = countBy(contributors);
        const contributorsWithPercentage = Object.keys(statementAmountPerContributor).map(contributorId => ({
            id: contributorId,
            percentage: Math.round((statementAmountPerContributor[contributorId] / contributors.length) * 100),
        }));

        return orderBy(contributorsWithPercentage, 'percentage', 'desc');
    };

    const getListById = useCallback(async id => {
        // can be the ID of either a "published list" or a "head list"
        let listResource = await getResource(id).catch(() => {});
        let isPublished = false;
        let listPublishedResource = null;
        if (!listResource) {
            notFound();
            return null;
        }

        let statements = [];
        const paramId = id;

        // for published lists
        if (listResource.classes.includes(CLASSES.LITERATURE_LIST_PUBLISHED)) {
            const resourceData = await getThing({ thingType: THING_TYPES.LIST, thingKey: id }).catch(e => {});
            if (!resourceData) {
                console.error('no resource data found');
                notFound();
                return null;
            }
            const { data } = resourceData;
            statements = data.statements;
            id = data.rootResource;
            listPublishedResource = listResource;
            listResource = statements.find(statement => statement.subject.id === id).subject;
            isPublished = true;
        } else if (listResource.classes.includes(CLASSES.LITERATURE_LIST)) {
            ({ statements } = await getStatementsBundleBySubject({
                id,
                blacklist: [CLASSES.RESEARCH_FIELD],
                maxLevel: 5,
            }));
        } else {
            console.error('no list classes found');
            notFound();
            return null;
        }

        // get all versions for this list
        const versions = await getVersions(listResource.id);

        // get the research field
        let researchField = null;
        const researchFieldStatement = statements.find(
            statement => statement.subject.id === id && statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD,
        );
        if (researchFieldStatement) {
            researchField = {
                id: researchFieldStatement.object.id,
                label: researchFieldStatement.object.label,
                statementId: researchFieldStatement.id,
            };
        }

        const sectionResources = getObjectsByPredicateAndSubject(statements, PREDICATES.HAS_SECTION, id);
        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(statements, section.id);
            sectionResources[index].statements = sectionStatements;
        }

        // legacy code check for when authors were still stored without lists, using PREDICATES.HAS_AUTHOR directly
        const authorStatements = getStatementsByPredicateAndSubject(statements, PREDICATES.HAS_AUTHOR, id);

        let authorResources = [];
        let authorListResource = {};

        if (authorStatements.length === 0) {
            authorResources = getAuthorsInList({ resourceId: listResource.id, statements });
            authorListResource = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_AUTHORS, false)?.[0];
        } else {
            // legacy author code
            for (const author of authorStatements) {
                const orcidStatements = getStatementsBySubjectId(statements, author.id);
                let orcid = null;
                if (orcidStatements.length) {
                    const orcidStatement = orcidStatements.find(statement => statement.predicate.id === PREDICATES.HAS_ORCID);
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
        const contentTypes = {};
        for (const [index, section] of sectionResources.entries()) {
            const sectionStatements = getStatementsBySubjectId(statements, section.id);
            sectionResources[index].statements = sectionStatements;
            const type = section.classes.length > 1 ? section.classes.find(_class => _class !== CLASSES.SECTION) : section.classes[0];

            const sectionData = {
                id: section.id,
                title: section.label,
                type,
            };

            if ([CLASSES.LIST_SECTION].includes(type)) {
                sectionData.entries = section.statements
                    .filter(statement => statement.predicate.id === PREDICATES.HAS_ENTRY)
                    .map(statement => {
                        const entry = statement.object;
                        const entryId = entry.id;
                        const entryStatements = getStatementsBySubjectId(statements, entryId);
                        // PREDICATES.HAS_PAPER to support legacy data
                        const contentType = entryStatements.find(
                            _statement => _statement.predicate.id === PREDICATES.HAS_PAPER || _statement.predicate.id === PREDICATES.HAS_LINK,
                        )?.object;
                        const description = entryStatements.find(_statement => _statement.predicate.id === PREDICATES.DESCRIPTION)?.object;
                        const contentTypeId = contentType?.id;
                        const paperStatements = getStatementsBySubjectId(statements, contentTypeId);
                        const authorList = paperStatements.find(_statement => _statement.predicate.id === PREDICATES.HAS_AUTHORS);
                        const data = contentTypeId
                            ? getPaperData(contentType, [
                                  ...getStatementsBySubjectId(statements, contentTypeId),
                                  ...getStatementsBySubjectId(statements, authorList?.object?.id),
                              ])
                            : {};
                        contentTypes[contentTypeId] = { ...data, paper: { label: data.label, id: data.id } };

                        return {
                            entry,
                            contentTypeId,
                            statementId: statement.id,
                            description,
                        };
                    })
                    .reverse();
            } else if ([CLASSES.TEXT_SECTION].includes(type)) {
                const contentStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_CONTENT);
                sectionData.content = {
                    id: contentStatement?.object?.id,
                    text: contentStatement?.object?.label,
                };

                const headingStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_HEADING_LEVEL);
                sectionData.heading = {
                    id: headingStatement?.object?.id,
                    level: headingStatement?.object?.label,
                };
            }

            sections.push(sectionData);
        }

        const contributors = getAllContributors(statements);

        return {
            id: paramId,
            listResource: listPublishedResource ?? null,
            list: {
                id: listResource.id,
                title: listResource.label,
            },
            authorResources,
            authorListResource,
            sections: sections.reverse(),
            isPublished,
            versions,
            researchField,
            statements,
            contributors,
            contentTypes,
        };
    }, []);

    const getContentTypeData = async id => {
        let statements = await getStatementsBySubject({ id });
        statements = await addAuthorsToStatements(statements);
        const contentTypeResource = await getResource(id);

        return {
            ...getPaperData(contentTypeResource, statements),
            contentType: { label: contentTypeResource.label, id: contentTypeResource.id },
        };
    };

    const load = useCallback(
        async id => {
            setIsLoading(true);
            const list = await getListById(id);

            if (list) {
                dispatch(listLoaded(list));
            }
            setIsLoading(false);
        },
        [dispatch, getListById],
    );

    const publishList = async ({ id, updateMessage, listId }) => {
        try {
            const { statements } = await getStatementsBundleBySubject({
                id,
            });
            const listTitle = statements.find(statement => statement.subject.id === id).subject.label;
            const versionResource = await createResource(listTitle, [CLASSES.LITERATURE_LIST_PUBLISHED]);
            const updateMessageLiteral = await createLiteral(updateMessage);
            await createLiteralStatement(versionResource.id, PREDICATES.DESCRIPTION, updateMessageLiteral.id);
            await createResourceStatement(id, PREDICATES.HAS_PUBLISHED_VERSION, versionResource.id);
            await createThing({ thingType: THING_TYPES.LIST, thingKey: versionResource.id, data: { rootResource: id, statements } });

            const versions = await getVersions(listId);
            dispatch(versionsSet(versions));

            toast.success('List published successfully');
            return versionResource.id;
        } catch (e) {
            toast.error('An error occurred when publishing the list');
            return null;
        }
    };

    return { load, isLoading, isNotFound, getListById, getVersions, publishList, getContentTypeData };
};

export default useList;
