import { useState, useEffect, useCallback } from 'react';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { getStatementsBySubjectAndPredicate, getStatementsBySubject } from 'services/backend/statements';

function useSmartReviewResearchField({ smartReviewId, initResearchField = null, initAuthors = [] }) {
    const [researchField, setResearchField] = useState(initResearchField);
    const [authors, setAuthors] = useState(initAuthors);
    const [isLoading, setIsLoading] = useState(false);

    const loadSubject = useCallback(() => {
        setIsLoading(true);
        getStatementsBySubjectAndPredicate({
            subjectId: smartReviewId,
            predicateId: PREDICATES.HAS_PAPER
        })
            .then(paper => {
                return paper?.length > 0 ? getStatementsBySubject({ id: paper[0].object.id }) : [];
            })
            .then(paperStatements => {
                setIsLoading(false);
                setResearchField(
                    filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD)
                );
                setAuthors(filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHOR, false));
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [smartReviewId]);

    useEffect(() => {
        if (!initResearchField && !!!initAuthors?.length) {
            loadSubject();
        }
    }, [initAuthors.length, initResearchField, loadSubject, smartReviewId]);

    return {
        researchField,
        authors: authors.reverse(),
        isLoading
    };
}
export default useSmartReviewResearchField;
