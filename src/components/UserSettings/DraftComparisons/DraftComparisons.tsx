import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { comparisonUrl, GetComparisonParams, getComparisons } from '@/services/backend/comparisons';
import { Comparison, PaginatedResponse } from '@/services/backend/types';

const getDraftComparisons = async (params: GetComparisonParams): Promise<PaginatedResponse<Comparison>> => {
    const response = await getComparisons(params);
    return {
        ...response,
        content: response.content.filter((c) => c.versions.published.length === 0),
    };
};

const DraftComparisons = () => {
    const { user } = useAuthentication();

    useEffect(() => {
        document.title = 'Draft comparisons - ORKG';
    });

    const renderListItem = (comparison: Comparison) => (
        <ShortRecord key={comparison.id} header={comparison.title} href={reverse(ROUTES.COMPARISON, { comparisonId: comparison.id })}>
            <div className="flex items-center gap-3 text-muted">
                <span className="flex items-center gap-1">
                    <FontAwesomeIcon size="sm" icon={faCalendar} />
                    {comparison.created_at ? dayjs(comparison.created_at).format('DD MMMM YYYY') : ''}
                </span>
                {comparison.created_at && (
                    <span className="flex items-center gap-1">
                        <FontAwesomeIcon size="sm" icon={faClock} />
                        {dayjs(comparison.created_at).format('H:mm')}
                    </span>
                )}
            </div>
        </ShortRecord>
    );

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className="mb-5 px-3">
                <h2 className="text-xl mb-2">View draft comparisons</h2>
                <p className="leading-relaxed rounded bg-surface-tertiary p-4">
                    When you start working on a comparison and it is not yet published, it is a <em>draft comparison</em>. These are listed below. As
                    soon as you publish a comparison, it becomes publicly listed and is removed from this page.
                </p>
            </div>
            <ListPage
                label="draft comparison"
                resourceClass={CLASSES.COMPARISON}
                renderListItem={renderListItem}
                fetchFunction={getDraftComparisons}
                fetchFunctionName="getDraftComparisons"
                fetchUrl={comparisonUrl}
                fetchExtraParams={{ created_by: user.id, published: false }}
                disableSearch
                hideTitleBar
            />
        </div>
    );
};

export default DraftComparisons;
