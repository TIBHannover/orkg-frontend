import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import ROUTES from 'constants/routes';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router-dom-v5-compat';
import NotFound from 'pages/NotFound';

/**
 * Component for redirecting contribution IDs to the paper view
 */
export default function Contribution(props) {
    const params = useParams();
    const contributionId = params.id;
    const [error, setError] = useState(false);
    const [paperId, setPaperId] = useState(null);
    const [isReview, setIsReview] = useState(false);

    useEffect(() => {
        getStatementsByObjectAndPredicate({ objectId: contributionId, predicateId: PREDICATES.HAS_CONTRIBUTION }).then(statements => {
            // check if statements are found and if "contributionId" has the contribution class
            if (!statements.length || !statements[0].object.classes.includes(CLASSES.CONTRIBUTION)) {
                setError(true);
                return;
            }

            const paperStatement = statements.find(
                _statement => _statement.subject.classes.includes(CLASSES.PAPER) || _statement.subject.classes.includes(CLASSES.SMART_REVIEW)
            );

            setIsReview(!!statements.find(_statement => _statement.subject.classes.includes(CLASSES.SMART_REVIEW)));

            if (!paperStatement) {
                setError(true);
                return;
            }

            setPaperId(paperStatement.subject.id);
        });
    }, [contributionId]);

    if (error) {
        return <NotFound />;
    } else if (!isReview && paperId) {
        return <Redirect to={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId, contributionId })} />;
    } else if (paperId) {
        return <Redirect to={reverse(ROUTES.REVIEW, { id: paperId })} />;
    } else {
        return <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>;
    }
}
