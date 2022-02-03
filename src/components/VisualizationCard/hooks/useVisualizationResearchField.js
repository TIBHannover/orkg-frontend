import { useState, useEffect, useCallback } from 'react';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { getStatementsByObjectAndPredicate, getStatementsBySubjectAndPredicate } from 'services/backend/statements';

function useVisualizationResearchField({ visualizationId }) {
    const [researchField, setResearchField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadSubject = useCallback(() => {
        setIsLoading(true);
        getStatementsByObjectAndPredicate({
            objectId: visualizationId,
            predicateId: PREDICATES.HAS_VISUALIZATION
        })
            .then(comparison => {
                return comparison?.length > 0
                    ? getStatementsBySubjectAndPredicate({ subjectId: comparison[0].subject.id, predicateId: PREDICATES.HAS_SUBJECT })
                    : [];
            })
            .then(comparisonStatement => {
                setIsLoading(false);
                setResearchField(
                    filterObjectOfStatementsByPredicateAndClass(comparisonStatement, PREDICATES.HAS_SUBJECT, true, CLASSES.RESEARCH_FIELD)
                );
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [visualizationId]);

    useEffect(() => {
        loadSubject();
    }, [loadSubject, visualizationId]);

    return {
        researchField,
        isLoading
    };
}
export default useVisualizationResearchField;
