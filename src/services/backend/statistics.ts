import { url } from 'constants/misc';
import qs from 'qs';
import backendApi from 'services/backend/backendApi';

export const statisticsUrl = `${url}statistics/`;
export const statisticsApi = backendApi.extend(() => ({ prefixUrl: statisticsUrl }));

type StatisticsResponse = {
    name: string;
    description: string;
    group: string;
    value: number;
    parameters: Array<{
        id: string;
        name: string;
        description: string;
        type: string;
    }>;
};

export const getStatistics = ({
    group = 'content-types',
    name = 'all',
    researchFieldId,
    includeSubfields,
    observatoryId,
}: {
    group: string;
    name: string;
    researchFieldId?: string;
    observatoryId?: string;
    includeSubfields?: boolean;
}) => {
    const searchParams = qs.stringify(
        { research_field: researchFieldId, include_subfields: includeSubfields, observatory_id: observatoryId },
        {
            skipNulls: true,
        },
    );

    return statisticsApi.get<StatisticsResponse>(`${group}/${name}?${searchParams}`).json();
};
