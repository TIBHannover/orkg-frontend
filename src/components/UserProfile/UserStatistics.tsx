import { Skeleton } from '@heroui/react';
import pluralize from 'pluralize';
import useSWR from 'swr';

import { CLASSES } from '@/constants/graphSettings';
import { getResources, resourcesUrl } from '@/services/backend/resources';

type StatisticDefinition = {
    label: string;
    class: string;
};

const STATISTICS: StatisticDefinition[] = [
    { label: 'Comparisons', class: CLASSES.COMPARISON },
    { label: 'Papers', class: CLASSES.PAPER },
    { label: 'Visualizations', class: CLASSES.VISUALIZATION },
    { label: 'Reviews', class: CLASSES.SMART_REVIEW },
    { label: 'Lists', class: CLASSES.LITERATURE_LIST_PUBLISHED },
    { label: 'Templates', class: CLASSES.NODE_SHAPE },
    { label: 'Statement templates', class: CLASSES.ROSETTA_NODE_SHAPE },
];

type UserStatisticsProps = {
    userId: string;
};

const UserStatistics = ({ userId }: UserStatisticsProps) => {
    const { data: statistics, isLoading } = useSWR(userId ? [userId, resourcesUrl, 'getUserStatistics'] : null, ([createdBy]) =>
        Promise.all(
            STATISTICS.map((statistic) =>
                getResources({ include: [statistic.class], created_by: createdBy }).then((result) => ({
                    label: statistic.label,
                    number: result.page.total_elements,
                })),
            ),
        ),
    );

    if (isLoading || !statistics) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {STATISTICS.map((statistic) => (
                    <Skeleton key={statistic.label} className="h-16 rounded-md" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {statistics.map((statistic) => (
                <div
                    key={statistic.label}
                    className="flex flex-col items-start justify-center rounded-md border border-divider bg-surface px-3 py-2 hover:border-primary/40 transition-colors"
                >
                    <span className="text-xl font-semibold leading-tight">{statistic.number}</span>
                    <span className="text-xs text-default-500 truncate w-full">{pluralize(statistic.label, statistic.number)}</span>
                </div>
            ))}
        </div>
    );
};

export default UserStatistics;
