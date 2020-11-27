import { useState, useCallback } from 'react';
import { createObject } from 'services/backend/misc';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { load as loadArticle } from 'actions/smartArticle';
import { useDispatch } from 'react-redux';

const useHeaderBar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const load = useCallback(
        async id => {
            setIsLoading(true);
            const paperResource = await getResource(id);
            const { bundle: paperStatements } = await getStatementsBundleBySubject({
                id
            });

            const authorResources = getObjectsByPredicateAndLevel(paperStatements, PREDICATES.HAS_AUTHOR, 0);
            const sectionResources = getObjectsByPredicateAndLevel(paperStatements, PREDICATES.HAS_SECTION, 1);

            for (const [index, section] of sectionResources.entries()) {
                const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
                sectionResources[index].statements = sectionStatements;
            }

            // add the orcid and statement id to the author statements
            for (const [index, author] of authorResources.entries()) {
                // orcid
                const orcidStatements = getStatementsBySubjectId(paperStatements, author.id);
                if (orcidStatements.length) {
                    const orcidStatement = orcidStatements.find(({ statement }) => statement.predicate.id === PREDICATES.HAS_ORCID);
                    const orcid = orcidStatement ? orcidStatement.statement.object.label : '';
                    authorResources[index].orcid = orcid;
                }

                // statementId
                const statementId = getStatementsByObjectId(paperStatements, author.id)[0].statement.id;
                authorResources[index].statementId = statementId;
            }

            const sections = [];
            for (const [index, section] of sectionResources.entries()) {
                const sectionStatements = getStatementsBySubjectId(paperStatements, section.id);
                sectionResources[index].statements = sectionStatements;
                console.log(section);
                const type = section.classes.find(_class => _class !== CLASSES.SECTION);
                const contentStatement = section.statements.find(({ statement }) => statement.predicate.id === PREDICATES.HAS_CONTENT);
                const content = contentStatement?.statement?.object;

                sections.push({
                    id: section.id,
                    title: {
                        id: section.id,
                        label: section.label
                    },
                    type: {
                        id: type
                    },
                    markdown: {
                        id: content.id,
                        label: content.label
                    }
                });
            }
            console.log(sections);

            dispatch(
                loadArticle({
                    paperResource,
                    authorResources: authorResources.reverse(),
                    sections
                })
            );

            setIsLoading(false);
        },
        [dispatch]
    );

    const getObjectsByPredicateAndLevel = (statements, predicateId, level) => {
        return statements
            .filter(statement => statement.statement.predicate.id === predicateId && statement.level === level)
            .map(({ statement }) => statement.object);
    };

    const getStatementsBySubjectId = (statements, subjectId) => {
        return statements.filter(statement => statement.statement.subject.id === subjectId);
    };

    const getStatementsByObjectId = (statements, objectId) => {
        return statements.filter(statement => statement.statement.object.id === objectId);
    };

    //const getStatementsBySubjectClassId = ({ bundle: statements }, classId) =>
    //    statements.filter(({ statement }) => statement.subject.classes.includes(classId)).map(({ statement }) => statement);

    return { load, isLoading };
};

export default useHeaderBar;
