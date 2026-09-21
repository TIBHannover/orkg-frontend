import { Chip, Skeleton } from '@heroui/react';
import useSWR from 'swr';

import { getPapersLinkedToResource, pathsUrl } from '@/services/backend/paths';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';

type TabLabelProps = {
    tabKey: string;
    id: string;
    label: string;
    statsValue?: number;
};

const TabLabel = ({ tabKey, id, label, statsValue }: TabLabelProps) => {
    const { data: count, isLoading: isStatisticsLoading } = useSWR(
        // only the page metadata is read for the count, so fetch a single row
        tabKey === 'papers' ? [{ id, page: 0, size: 1 }, pathsUrl, 'getPapersLinkedToResource'] : null,
        ([params]) => getPapersLinkedToResource(params),
    );

    const { data: countStatements, isLoading: isStatementsStatsLoading } = useSWR(
        tabKey === 'information'
            ? [
                  {
                      group: 'things',
                      name: 'statement-count',
                      parameters: { subject_id: id },
                  },
                  statisticsUrl,
                  'getStatistics',
              ]
            : null,
        ([params]) => getStatistics(params),
    );

    return (
        <span className="cursor-pointer">
            {label}
            {(isStatisticsLoading || count || statsValue !== undefined || isStatementsStatsLoading || countStatements !== undefined) && (
                <Chip className="ml-1 px-2">
                    {(isStatisticsLoading || isStatementsStatsLoading) && <Skeleton className="w-2.5 h-4 rounded" />}
                    {!isStatisticsLoading && count?.page?.totalElements?.toLocaleString('en-US', { notation: 'compact' })}
                    {!isStatementsStatsLoading && countStatements?.value.toLocaleString('en-US', { notation: 'compact' })}
                    {!isStatisticsLoading && statsValue?.toLocaleString('en-US', { notation: 'compact' })}
                </Chip>
            )}
        </span>
    );
};

export default TabLabel;
