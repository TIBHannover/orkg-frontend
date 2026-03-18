import React from 'react';
import Skeleton from 'react-loading-skeleton';
import useSWR from 'swr';

import Badge from '@/components/Ui/Badge/Badge';
import { getPapersLinkedToResource, papersUrl } from '@/services/backend/papers';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';
import { PaginatedResponse, Resource } from '@/services/backend/types';

type TabLabelProps = {
    tabKey: string;
    id: string;
    label: string;
    statsValue?: number;
};

const TabLabel = ({ tabKey, id, label, statsValue }: TabLabelProps) => {
    const { data: count, isLoading: isStatisticsLoading } = useSWR(
        tabKey === 'papers' ? [{ id, page: 0 }, papersUrl, 'getPapersLinkedToResource'] : null,
        ([params]) => getPapersLinkedToResource(params) as Promise<PaginatedResponse<Resource>>,
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
                <Badge color="light" pill className="ms-1 px-2">
                    {(isStatisticsLoading || isStatementsStatsLoading) && <Skeleton width={10} />}
                    {!isStatisticsLoading && count?.page?.total_elements?.toLocaleString('en-US', { notation: 'compact' })}
                    {!isStatementsStatsLoading && countStatements?.value.toLocaleString('en-US', { notation: 'compact' })}
                    {!isStatisticsLoading && statsValue?.toLocaleString('en-US', { notation: 'compact' })}
                </Badge>
            )}
        </span>
    );
};

export default TabLabel;
