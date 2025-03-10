import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import { type ResearchField } from 'components/ResearchFieldSelector/ResearchFieldSelector';
import { Badge } from 'reactstrap';
import { getResearchFieldsStatsWithSubfields, statsUrl } from 'services/backend/stats';
import useSWR from 'swr';

const FieldStatistics = ({ field }: { field: ResearchField }) => {
    const { data: statistics, isLoading } = useSWR(field.id ? [field.id, statsUrl, 'getResearchFieldsStatsWithSubfields'] : null, ([params]) =>
        getResearchFieldsStatsWithSubfields(params),
    );

    return (
        <Tooltip
            content={
                <div>
                    Number of content items in this field: {statistics?.total}{' '}
                    <ul>
                        <li>Papers: {statistics?.papers}</li>
                        <li>Comparisons: {statistics?.comparisons}</li>
                    </ul>
                </div>
            }
            contentStyle={{ maxWidth: '300px' }}
        >
            <div className="justify-content-end">
                <Badge color="light" pill>
                    {!isLoading && statistics?.total}
                    {isLoading && <FontAwesomeIcon icon={faSpinner} />}
                </Badge>
            </div>
        </Tooltip>
    );
};

export default FieldStatistics;
