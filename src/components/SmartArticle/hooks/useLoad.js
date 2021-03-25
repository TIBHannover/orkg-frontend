import { load as loadArticle } from 'actions/smartArticle';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getResource } from 'services/backend/resources';
import { getStatementsBundleBySubject, getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { getResourceData } from 'services/similarity';

const useHeaderBar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const dispatch = useDispatch();

    const load = useCallback(
        async id => {
            setIsLoading(true);
            let paperResource = await getResource(id).catch(e => {});
            let isPublished = false;
            if (!paperResource) {
                notFound();
                return;
            }

            let paperStatements = [];

            // for published articles
            if (paperResource.classes.includes(CLASSES.SMART_ARTICLE_PUBLISHED)) {
                const {
                    data: { rootResource, statements }
                } = await getResourceData(id);

                paperStatements = statements;
                id = rootResource;
                paperResource = statements.find(statement => statement.subject.id === id).subject;
                isPublished = true;
            } else {
                const { statements } = await getStatementsBundleBySubject({
                    id
                });
                paperStatements = statements;
            }

            // get all published versions for this article
            const versions = await getVersions(paperResource.id);

            const contributionResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_CONTRIBUTION, id);

            if (contributionResources.length === 0) {
                console.log('no contributions found');
                notFound();
                return;
            }

            const contributionResource = contributionResources.find(statement => statement.classes.includes(CLASSES.CONTRIBUTION_SMART_ARTICLE));

            if (!contributionResource) {
                console.log('no contribution with class "CONTRIBUTION_SMART_ARTICLE" found');
                notFound();
                return;
            }
            const authorResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_AUTHOR, id);
            const sectionResources = getObjectsByPredicateAndSubject(paperStatements, PREDICATES.HAS_SECTION, contributionResource.id);

            for (const [index, section] of sectionResources.entries()) {
                const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
                sectionResources[index].statements = sectionStatements;
            }

            // add the orcid and statement id to the author statements
            for (const [index, author] of authorResources.entries()) {
                // orcid
                const orcidStatements = getStatementsBySubjectId(paperStatements, author.id);
                if (orcidStatements.length) {
                    const orcidStatement = orcidStatements.find(statement => statement.predicate.id === PREDICATES.HAS_ORCID);
                    const orcid = orcidStatement ? orcidStatement.object.label : '';
                    authorResources[index].orcid = orcid;
                }

                // statementId
                const statementId = getStatementsByObjectId(paperStatements, author.id)[0]?.id;
                authorResources[index].statementId = statementId;
            }

            const sections = [];
            for (const [index, section] of sectionResources.entries()) {
                const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
                sectionResources[index].statements = sectionStatements;
                const type = section.classes.length > 1 ? section.classes.find(_class => _class !== CLASSES.SECTION) : section.classes[0];
                let markdown = null;
                let contentLink = null;

                if (type === CLASSES.RESOURCE_SECTION || type === CLASSES.PROPERTY_SECTION || type === CLASSES.COMPARISON_SECTION) {
                    const linkStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_LINK);
                    const link = linkStatement?.object;

                    contentLink = {
                        id: section?.id,
                        objectId: link?.id,
                        label: link?.label
                    };
                } else {
                    const contentStatement = section.statements.find(statement => statement.predicate.id === PREDICATES.HAS_CONTENT);
                    const content = contentStatement?.object;
                    markdown = {
                        id: content?.id,
                        label: content?.label
                    };
                }

                sections.push({
                    id: section.id,
                    title: {
                        id: section.id,
                        label: section.label
                    },
                    type: {
                        id: type
                    },
                    markdown,
                    contentLink
                });
            }
            dispatch(
                loadArticle({
                    paper: {
                        id: paperResource.id,
                        title: paperResource.label
                    },
                    contributionId: contributionResource.id,
                    authorResources: authorResources.reverse(),
                    sections: sections.reverse(),
                    isPublished,
                    versions
                })
            );

            setIsLoading(false);
        },
        [dispatch]
    );

    const getVersions = async paperId => {
        const statements = await getStatementsByObjectAndPredicate({ objectId: paperId, predicateId: PREDICATES.HAS_PAPER });
        const ids = statements.map(version => version.subject.id);
        const versionsStatements = await getStatementsBySubjects({ ids });

        return versionsStatements
            .map(versionSubject => ({
                ...versionSubject.statements.find(
                    statement =>
                        statement.subject.classes.includes(CLASSES.SMART_ARTICLE_PUBLISHED) && statement.predicate.id === PREDICATES.DESCRIPTION
                )
            }))
            .map(statement => ({
                id: statement.subject.id,
                date: statement.subject.created_at,
                description: statement.object.label,
                creator: statement.object.created_by
            }));
    };

    const notFound = () => {
        setIsNotFound(true);
        setIsLoading(false);
    };

    const getObjectsByPredicateAndSubject = (statements, predicateId, subjectId) => {
        return statements
            .filter(statement => statement.predicate.id === predicateId && statement.subject.id === subjectId)
            .map(statement => statement.object);
    };

    const getStatementsBySubjectId = (statements, subjectId) => {
        return statements.filter(statement => statement.subject.id === subjectId);
    };

    const getStatementsByObjectId = (statements, objectId) => {
        return statements.filter(statement => statement.object.id === objectId);
    };

    return { load, isLoading, isNotFound };
};

export default useHeaderBar;
