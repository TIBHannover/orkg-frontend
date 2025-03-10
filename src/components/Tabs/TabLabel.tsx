import { CLASSES } from 'constants/graphSettings';
import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Badge } from 'reactstrap';
import { getStatistics, statisticsUrl } from 'services/backend/statistics';
import { VisibilityOptions } from 'services/backend/types';
import useSWR from 'swr';

interface TabLabelProps {
    label: string;
    showCount?: boolean;
    classId: string;
    countParams: {
        researchFieldId?: string;
        includeSubfields?: boolean;
        observatoryId?: string;
        visibility?: VisibilityOptions;
        createdBy?: string;
        published?: boolean;
        sdgId?: string;
    };
}

const getStatsName = (classId: string) => {
    switch (classId) {
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

const TabLabel: FC<TabLabelProps> = ({ label, showCount = false, classId, countParams }) => {
    const { data: count, isLoading: isStatisticsLoading } = useSWR(
        showCount
            ? [
                  {
                      group: 'content-types',
                      ...countParams,
                      includeSubfields: countParams.researchFieldId ? countParams.includeSubfields : undefined,
                      name: getStatsName(classId),
                  },
                  statisticsUrl,
                  'getStatistics',
              ]
            : null,
        ([params]) => getStatistics(params),
    );

    return (
        <>
            {label}
            {showCount && (isStatisticsLoading || count) && (
                <Badge color="light" pill className="ms-1 px-2">
                    {isStatisticsLoading && <Skeleton width={10} />}
                    {!isStatisticsLoading && count?.value.toLocaleString('en-US', { notation: 'compact' })}
                </Badge>
            )}
        </>
    );
};
export default TabLabel;
