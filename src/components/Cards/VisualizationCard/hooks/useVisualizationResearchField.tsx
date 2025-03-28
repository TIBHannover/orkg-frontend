import { useCallback, useEffect, useState } from 'react';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { getStatements } from '@/services/backend/statements';
import { Node } from '@/services/backend/types';
import { filterObjectOfStatementsByPredicateAndClass } from '@/utils';

function useVisualizationResearchField({ visualizationId }: { visualizationId: string }) {
    const [researchField, setResearchField] = useState<Node | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const loadSubject = useCallback(() => {
        setIsLoading(true);
        getStatements({
            objectId: visualizationId,
            predicateId: PREDICATES.HAS_VISUALIZATION,
        })
            .then((comparison) =>
                comparison?.length > 0 ? getStatements({ subjectId: comparison[0].subject.id, predicateId: PREDICATES.HAS_SUBJECT }) : [],
            )
            .then((comparisonStatement) => {
                setIsLoading(false);
                setResearchField(
                    filterObjectOfStatementsByPredicateAndClass(comparisonStatement, PREDICATES.HAS_SUBJECT, true, CLASSES.RESEARCH_FIELD),
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
        isLoading,
    };
}
export default useVisualizationResearchField;
