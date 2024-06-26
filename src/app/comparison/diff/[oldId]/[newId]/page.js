'use client';

import useDiff from 'components/DiffView/useDiff';
import DiffView from 'components/DiffView/DiffView';
import ROUTES from 'constants/routes';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubject } from 'services/backend/statements';
import { addAuthorsToStatements, getComparisonData } from 'utils';
import { reverse } from 'named-urls';
import moment from 'moment';

const ComparisonDiff = () => {
    const { comparisonToPlainText } = useDiff();

    const getTitleData = (comparison) => ({
        creator: comparison.created_by,
        route: reverse(ROUTES.COMPARISON, { comparisonId: comparison.id }),
        headerText: <span>Published on {comparison ? moment(comparison.created_at).format('DD MMMM YYYY - H:m:s') : null}</span>,
        buttonText: 'View comparison',
    });

    const getData = async ({ oldId, newId }) =>
        Promise.all([
            getResource(oldId),
            getResource(newId),
            getStatementsBySubject({ id: oldId }).then((statements) => addAuthorsToStatements(statements)),
            getStatementsBySubject({ id: newId }).then((statements) => addAuthorsToStatements(statements)),
        ]).then(([oldResource, newResource, oldStatements, newStatements]) => ({
            oldText: comparisonToPlainText(getComparisonData(oldResource, oldStatements)),
            newText: comparisonToPlainText(getComparisonData(newResource, newStatements)),
            oldTitleData: getTitleData(oldResource),
            newTitleData: getTitleData(newResource),
        }));

    return <DiffView diffRoute={ROUTES.COMPARISON_DIFF} type="comparison" getData={getData} />;
};

export default ComparisonDiff;
