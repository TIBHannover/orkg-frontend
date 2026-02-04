import Skeleton from 'react-loading-skeleton';
import useSWR from 'swr';

import { type ResearchField } from '@/components/ResearchFieldSelector/ResearchFieldSelector';
import Badge from '@/components/Ui/Badge/Badge';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';

const FieldStatistics = ({ field }: { field: ResearchField }) => {
    const { data: statistics, isLoading } = useSWR(
        [
            {
                group: 'content-types',
                name: 'content-type-count',
                parameters: { research_field: field.id, include_subfields: 'true' },
            },
            statisticsUrl,
            'getStatistics',
        ],
        ([params]) => getStatistics(params),
    );

    return (
        <div className="justify-content-end">
            <Badge color="light" pill>
                {!isLoading && statistics?.value.toLocaleString('en-US')}
                {isLoading && <Skeleton width={30} />}
            </Badge>
        </div>
    );
};

export default FieldStatistics;
