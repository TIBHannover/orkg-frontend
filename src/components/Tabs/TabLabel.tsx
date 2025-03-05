import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { useQueryState } from 'nuqs';
import { FC } from 'react';
import { Badge } from 'reactstrap';
import { getStatistics, statisticsUrl } from 'services/backend/statistics';
import { VisibilityOptions } from 'services/backend/types';
import useSWR from 'swr';

interface TabLabelProps {
    label: string;
    showCount?: boolean;
    classId: string;
    researchFieldId?: string;
    observatoryId?: string;
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
            return 'all-count';
    }
};

const TabLabel: FC<TabLabelProps> = ({ label, showCount = false, classId, researchFieldId, observatoryId }) => {
    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const [includeSubfields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const { data: count, isLoading: isStatisticsLoading } = useSWR(
        showCount
            ? [
                  {
                      group: 'content-types',
                      researchFieldId,
                      includeSubfields: researchFieldId ? includeSubfields : undefined,
                      sort,
                      name: getStatsName(classId),
                      observatoryId,
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
            {showCount && (
                <>
                    {isStatisticsLoading && <FontAwesomeIcon icon={faSpinner} spin className="ms-1" />}
                    {!isStatisticsLoading && count && (
                        <Badge color="light" pill className="ms-1 px-2">
                            {count.value}
                        </Badge>
                    )}
                </>
            )}
        </>
    );
};
export default TabLabel;
