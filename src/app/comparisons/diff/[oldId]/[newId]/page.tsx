'use client';

import dayjs from 'dayjs';
import { reverse } from 'named-urls';

import DiffView from '@/components/DiffView/DiffView';
import useDiff from '@/components/DiffView/useDiff';
import ROUTES from '@/constants/routes';
import { getComparison, getComparisonContents } from '@/services/backend/comparisons';
import { Comparison } from '@/services/backend/types';

const ComparisonDiff = () => {
    const { comparisonToPlainText } = useDiff();

    const getTitleData = (comparison: Comparison) => ({
        creator: comparison.created_by,
        route: reverse(ROUTES.COMPARISON, { comparisonId: comparison.id }),
        headerText: <span>Published on {comparison ? dayjs(comparison.created_at).format('DD MMMM YYYY - H:m:s') : null}</span>,
        buttonText: 'View comparison',
    });

    const getData = async ({ oldId, newId }: { oldId: string; newId: string }) =>
        Promise.all([getComparison(oldId), getComparison(newId), getComparisonContents(oldId), getComparisonContents(newId)]).then(
            ([oldComparison, newComparison, oldContents, newContents]) => ({
                oldText: comparisonToPlainText({ comparison: oldComparison, comparisonContents: oldContents }),
                newText: comparisonToPlainText({ comparison: newComparison, comparisonContents: newContents }),
                oldTitleData: getTitleData(oldComparison),
                newTitleData: getTitleData(newComparison),
            }),
        );

    return <DiffView diffRoute={ROUTES.COMPARISON_DIFF} type="comparison" getData={getData} />;
};

export default ComparisonDiff;
