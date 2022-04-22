import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import ROUTES from 'constants/routes';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { filterSubjectOfStatementsByPredicateAndClass } from 'utils';
import { reverse } from 'named-urls';
import { Redirect } from 'react-router-dom';
import NotFound from 'pages/NotFound';
import { useParams } from 'react-router-dom-v5-compat';

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
            predicateId: PREDICATES.HAS_VISUALIZATION
        }).then(statements => {
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
        return <NotFound />;
    } else if (comparisonId) {
        return <Redirect to={reverse(ROUTES.COMPARISON, { comparisonId: comparisonId }) + '#Vis' + visualizationId} />;
    } else {
        return <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>;
    }
}
