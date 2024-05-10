'use client';

import redirect from 'components/NextJsMigration/redirect';
import useParams from 'components/NextJsMigration/useParams';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { filterSubjectOfStatementsByPredicateAndClass } from 'utils';

/**
 * Component for redirecting visualization IDs to the comparison view
 */
export default function Visualization() {
    const params = useParams();
    const visualizationId = params.id;
    const [error, setError] = useState(false);
    const [comparisonId, setComparisonId] = useState(null);

    useEffect(() => {
        getStatementsByObjectAndPredicate({
            objectId: visualizationId,
            predicateId: PREDICATES.HAS_VISUALIZATION,
        }).then((statements) => {
            // check if statements are found and if "visualizationId" has the contribution class
            const comparison = filterSubjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_VISUALIZATION, true, CLASSES.COMPARISON);
            if (!comparison) {
                setError(true);
                return;
            }
            setComparisonId(comparison.id);
        });
    }, [visualizationId]);

    if (error) {
        return redirect(`${reverse(ROUTES.RESOURCE, { id: visualizationId })}?noRedirect`);
    }
    if (comparisonId) {
        return redirect(`${reverse(ROUTES.COMPARISON, { comparisonId })}#Vis${visualizationId}`);
    }
    return <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>;
}
