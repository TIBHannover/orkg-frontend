import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import { getStatementsByObject } from 'services/backend/statements';
import { CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { Redirect } from 'react-router-dom';
import NotFound from 'pages/NotFound';

/**
 * Component for redirecting contribution IDs to the paper view
 */
export default function Contribution(props) {
    const contributionId = props.match.params.id;
    const [error, setError] = useState(false);
    const [paperId, setPaperId] = useState(null);

    useEffect(() => {
        getStatementsByObject({
            id: contributionId
        }).then(statements => {
            // check if statements are found and if "contributionId" has the contribution class
            if (!statements.length || !statements[0].object.classes.includes(CLASSES.CONTRIBUTION)) {
                setError(true);
                return;
            }

            const paperStatement = statements.find(_statement => _statement.subject.classes.includes(CLASSES.PAPER));
            if (!paperStatement) {
                setError(true);
                return;
            }

            setPaperId(paperStatement.subject.id);
        });
    }, [contributionId]);

    if (error) {
        return <NotFound />;
    } else if (paperId) {
        return <Redirect to={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId, contributionId })} />;
    } else {
        return <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>;
    }
}

Contribution.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};
