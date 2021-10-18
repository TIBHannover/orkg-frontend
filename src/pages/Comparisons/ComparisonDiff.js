import useDiff from 'components/Comparison/Diff/hooks/useDiff';
import DiffView from 'components/DiffView/DiffView';
import ROUTES from 'constants/routes';
import React from 'react';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubject } from 'services/backend/statements';
import { getComparisonData } from 'utils';
import { reverse } from 'named-urls';
import moment from 'moment';

const ComparisonDiff = () => {
    const { comparisonToPlainText } = useDiff();

    const getData = async ({ oldId, newId }) => {
        return await Promise.all([
            getResource(oldId),
            getResource(newId),
            getStatementsBySubject({ id: oldId }),
            getStatementsBySubject({ id: newId })
        ]).then(([oldResource, newResource, oldStatements, newStatements]) => ({
            oldText: comparisonToPlainText(getComparisonData(oldResource, oldStatements)),
            newText: comparisonToPlainText(getComparisonData(newResource, newStatements)),
            oldTitleData: getTitleData(oldResource),
            newTitleData: getTitleData(newResource)
        }));
    };

    const getTitleData = comparison => ({
        creator: comparison.created_by,
        route: reverse(ROUTES.COMPARISON, { comparisonId: comparison.id }),
        headerText: <span>Published on {comparison ? moment(comparison.created_at).format('DD MMMM YYYY - H:m:s') : null}</span>,
        buttonText: 'View comparison'
    });

    return <DiffView diffRoute={ROUTES.COMPARISON_DIFF} typeRoute={ROUTES.COMPARISON} type="comparison" getData={getData} />;
};

export default ComparisonDiff;
