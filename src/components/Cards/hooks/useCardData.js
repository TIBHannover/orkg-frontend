import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { useCallback, useEffect, useState } from 'react';
import { getStatementsByObjectAndPredicate, getStatementsBySubject } from 'services/backend/statements';
import { convertAuthorsToNewFormat, filterObjectOfStatementsByPredicateAndClass, getAuthorStatements } from 'utils';

function useCardData({ id, initResearchField = null, initAuthors = [], isList = false }) {
    const [researchField, setResearchField] = useState(initResearchField);
    const [authors, setAuthors] = useState(initAuthors);
    const [isLoading, setIsLoading] = useState(false);

    const loadSubject = useCallback(() => {
        setIsLoading(true);
        getStatementsByObjectAndPredicate({
            objectId: id,
            predicateId: PREDICATES.HAS_PUBLISHED_VERSION,
        })
            .then(async (subject) => {
                if (subject?.length > 0) {
                    const statements = await getStatementsBySubject({ id: subject[0].subject.id });
                    setResearchField(
                        filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD),
                    );
                    const authorStatements = await getAuthorStatements(statements);
                    setAuthors(convertAuthorsToNewFormat(authorStatements.map((statement) => statement.object)));
                }
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [id, isList]);

    useEffect(() => {
        if (!initResearchField && !initAuthors?.length) {
            loadSubject();
        }
    }, [initAuthors.length, initResearchField, loadSubject, id]);

    return {
        researchField,
        authors,
        isLoading,
    };
}
export default useCardData;
