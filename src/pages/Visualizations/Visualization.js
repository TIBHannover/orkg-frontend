import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { Redirect } from 'react-router-dom';
import NotFound from 'pages/NotFound';

/**
 * Component for redirecting visualization IDs to the comparison view
 */
export default function Visualization(props) {
    const visualizationId = props.match.params.id;
    const [error, setError] = useState(false);
    const [comparisonId, setComparisonId] = useState(null);

    useEffect(() => {
        getStatementsByObjectAndPredicate({ objectId: visualizationId, predicateId: PREDICATES.HAS_VISUALIZATION }).then(statements => {
            // check if statements are found and if "visualizationId" has the visualization class
            if (!statements.length || !statements[0].object.classes.includes(CLASSES.VISUALIZATION)) {
                setError(true);
                return;
            }

            const comparisonStatement = statements.find(_statement => _statement.subject.classes.includes(CLASSES.COMPARISON));
            if (!comparisonStatement) {
                setError(true);
                return;
            }

            setComparisonId(comparisonStatement.subject.id);
        });
    }, [visualizationId]);

    if (error) {
        return <NotFound />;
    } else if (comparisonId) {
        return <Redirect to={reverse(ROUTES.COMPARISON, { comparisonId: comparisonId })} />;
    } else {
        return <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>;
    }
}

Visualization.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};
