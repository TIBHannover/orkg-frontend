import { Chip, Skeleton } from '@heroui/react';
import { StatisticsApiFindMetricByGroupAndNameRequest } from '@orkg/orkg-client';
import { FC } from 'react';
import useSWR from 'swr';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { CLASSES } from '@/constants/graphSettings';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';

type TabLabelProps = {
    group?: 'content-types' | 'things';
    label: string;
    showCount?: boolean;
    classId: string;
    countParams?: StatisticsApiFindMetricByGroupAndNameRequest['parameters'];
    description?: string;
};

const getStatsName = (classId: string) => {
    switch (classId) {
        case 'statement-count':
            return 'statement-count';
        case CLASSES.COMPARISON:
            return 'comparison-count';
        case CLASSES.PAPER:
            return 'paper-count';
        case CLASSES.VISUALIZATION:
            return 'visualization-count';
        case CLASSES.SMART_REVIEW_PUBLISHED:
            return 'smart-review-count';
        case CLASSES.LITERATURE_LIST_PUBLISHED:
            return 'literature-list-count';
        case CLASSES.NODE_SHAPE:
            return 'template-count';
        case CLASSES.ROSETTA_NODE_SHAPE:
            return 'rosetta-stone-template-count';
        case CLASSES.ROSETTA_STONE_STATEMENT:
            return 'rosetta-stone-statement-count';
        default:
            return 'content-type-count';
    }
};

const TabLabel: FC<TabLabelProps> = ({ group = 'content-types', label, showCount = false, classId, countParams, description }) => {
    const { data: count, isLoading: isStatisticsLoading } = useSWR(
        showCount
            ? [
                  {
                      group,
                      name: getStatsName(classId),
                      ...(countParams
                          ? { parameters: { ...countParams, ...(countParams.research_field ? { include_subfields: 'true' } : {}) } }
                          : {}),
                  },
                  statisticsUrl,
                  'getStatistics',
              ]
            : null,
        ([params]) => getStatistics(params),
    );

    return (
        <Tooltip content={description} disabled={!description}>
            <span className="cursor-pointer">
                {label}

                {showCount && (isStatisticsLoading || count) && (
                    <Chip className="ml-1 px-2">
                        {isStatisticsLoading && <Skeleton className="w-2.5 h-4 rounded" />}
                        {!isStatisticsLoading && count?.value.toLocaleString('en-US', { notation: 'compact' })}
                    </Chip>
                )}
            </span>
        </Tooltip>
    );
};
export default TabLabel;
