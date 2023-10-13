import { useState, useEffect, useCallback } from 'react';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { filterObjectOfStatementsByPredicateAndClass, getAuthorStatements } from 'utils';
import { getStatementsBySubjectAndPredicate, getStatementsBySubject } from 'services/backend/statements';

function useCardData({ id, initResearchField = null, initAuthors = [], isList = false }) {
    const [researchField, setResearchField] = useState(initResearchField);
    const [authors, setAuthors] = useState(initAuthors);
    const [isLoading, setIsLoading] = useState(false);

    const loadSubject = useCallback(() => {
        setIsLoading(true);
        getStatementsBySubjectAndPredicate({
            subjectId: id,
            predicateId: isList ? PREDICATES.HAS_LIST : PREDICATES.HAS_PAPER,
        })
            .then(async subject => {
                if (subject?.length > 0) {
                    const statements = await getStatementsBySubject({ id: subject[0].object.id });
                    setResearchField(
                        filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD),
                    );
                    const authorStatements = await getAuthorStatements(statements);
                    setAuthors(authorStatements.map(statement => statement.object));
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
