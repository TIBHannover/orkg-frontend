import useSWR from 'swr';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { getPaper } from '@/services/backend/papers';
import { getStatements, statementsUrl } from '@/services/backend/statements';

const usePaperContributionCheck = (entityId: string) => {
    const { data: paper, mutate } = useSWR(entityId ? [entityId, statementsUrl, 'getStatements'] : null, ([_params]) =>
        getStatements({
            objectId: _params,
            subjectClasses: [CLASSES.PAPER],
            predicateId: PREDICATES.HAS_CONTRIBUTION,
            returnContent: true,
            returnFormattedLabels: true,
        }).then((statements) => (statements[0]?.subject ? getPaper(statements[0]?.subject.id) : null)),
    );

    return { paper, mutate };
};

export default usePaperContributionCheck;
