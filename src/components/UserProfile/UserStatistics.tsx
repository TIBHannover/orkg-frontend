import { Skeleton } from '@heroui/react';
import { StatisticsApiFindMetricByGroupAndNameRequest } from '@orkg/orkg-client';
import { useQueryState } from 'nuqs';
import pluralize from 'pluralize';
import useSWR from 'swr';

import { getStatsName } from '@/components/Tabs/TabLabel';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';
import { VisibilityOptions } from '@/services/backend/types';

type StatisticsParameters = NonNullable<StatisticsApiFindMetricByGroupAndNameRequest['parameters']>;

const STATISTICS: { label: string; classId: string; parameters?: StatisticsParameters }[] = [
    { label: 'Comparisons', classId: CLASSES.COMPARISON, parameters: { published: 'true' } },
    { label: 'Papers', classId: CLASSES.PAPER },
    { label: 'Visualizations', classId: CLASSES.VISUALIZATION },
    { label: 'Reviews', classId: CLASSES.SMART_REVIEW_PUBLISHED, parameters: { published: 'true' } },
    { label: 'Lists', classId: CLASSES.LITERATURE_LIST_PUBLISHED, parameters: { published: 'true' } },
    { label: 'Templates', classId: CLASSES.NODE_SHAPE },
    { label: 'Statement templates', classId: CLASSES.ROSETTA_NODE_SHAPE },
];

type UserStatisticsProps = {
    userId: string;
};

const UserStatistics = ({ userId }: UserStatisticsProps) => {
    const [visibility] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const { data: statistics, isLoading } = useSWR(
        userId ? [userId, visibility, statisticsUrl, 'getStatistics'] : null,
        ([uId, selectedVisibility]) =>
            Promise.all(
                STATISTICS.map((statistic) =>
                    getStatistics({
                        group: 'content-types',
                        name: getStatsName(statistic.classId),
                        parameters: { created_by: uId, visibility: selectedVisibility, ...statistic.parameters },
                    }).then((metric) => ({ statistic, metric })),
                ),
            ),
    );

    if (isLoading || !statistics) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {STATISTICS.map((statistic) => (
                    <Skeleton key={statistic.classId} className="h-16 rounded-md" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {statistics.map(({ statistic, metric }, index) => (
                <div
                    key={statistic.classId}
                    className="flex flex-col items-start justify-center rounded-md border border-divider bg-surface px-3 py-2 hover:border-primary/40 transition-colors"
                >
                    <span className="text-xl font-semibold leading-tight">{metric.value.toLocaleString('en-US', { notation: 'compact' })}</span>
                    <span className="text-xs text-default-500 truncate w-full">{pluralize(STATISTICS[index].label, metric.value)}</span>
                </div>
            ))}
        </div>
    );
};

export default UserStatistics;
