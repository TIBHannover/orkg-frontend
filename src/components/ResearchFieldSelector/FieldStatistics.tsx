import { Chip, Skeleton } from '@heroui/react';
import useSWR from 'swr';

import { type ResearchField } from '@/components/ResearchFieldSelector/ResearchFieldSelector';
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
        <div className="justify-end">
            <Chip>
                {!isLoading && statistics?.value.toLocaleString('en-US')}
                {isLoading && <Skeleton className="w-[30px] h-4 rounded" />}
            </Chip>
        </div>
    );
};

export default FieldStatistics;
