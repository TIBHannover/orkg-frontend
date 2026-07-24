import useSWR from 'swr';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Node } from '@/services/backend/types';
import { filterObjectOfStatementsByPredicateAndClass } from '@/utils';

function useVisualizationResearchField({ visualizationId }: { visualizationId: string }) {
    const { data: researchField, isLoading } = useSWR(
        visualizationId ? [{ objectId: visualizationId, predicateId: PREDICATES.HAS_VISUALIZATION }, statementsUrl, 'getStatements'] : null,
        async ([params]) => {
            const comparison = await getStatements(params);
            if (!comparison?.length) {
                return undefined;
            }
            const comparisonStatements = await getStatements({ subjectId: comparison[0].subject.id, predicateId: PREDICATES.HAS_SUBJECT });
            return filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_SUBJECT, true, CLASSES.RESEARCH_FIELD) as
                | Node
                | undefined;
        },
        { shouldRetryOnError: false },
    );

    return {
        researchField,
        isLoading,
    };
}
export default useVisualizationResearchField;
