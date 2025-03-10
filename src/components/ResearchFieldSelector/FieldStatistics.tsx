import { type ResearchField } from 'components/ResearchFieldSelector/ResearchFieldSelector';
import Skeleton from 'react-loading-skeleton';
import { Badge } from 'reactstrap';
import { getStatistics, statisticsUrl } from 'services/backend/statistics';
import useSWR from 'swr';

const FieldStatistics = ({ field }: { field: ResearchField }) => {
    const { data: statistics, isLoading } = useSWR(
        [
            {
                group: 'content-types',
                name: 'content-type-count',
                researchFieldId: field.id,
                includeSubfields: true,
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
