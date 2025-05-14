import qs from 'qs';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { VisibilityOptions } from '@/services/backend/types';

export const statisticsUrl = `${url}statistics/`;
export const statisticsApi = backendApi.extend(() => ({ prefixUrl: statisticsUrl }));

export type StatisticsResponse = {
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
    visibility,
    published,
    createdBy,
    sdgId,
}: {
    group: string;
    name: string;
    researchFieldId?: string;
    observatoryId?: string;
    includeSubfields?: boolean;
    visibility?: VisibilityOptions;
    published?: boolean;
    createdBy?: string;
    sdgId?: string;
}): Promise<StatisticsResponse> => {
    const searchParams = qs.stringify(
        {
            research_field: researchFieldId,
            include_subfields: includeSubfields,
            observatory_id: observatoryId,
            visibility: visibility === VISIBILITY_FILTERS.TOP_RECENT ? VISIBILITY_FILTERS.ALL_LISTED : visibility,
            published,
            created_by: createdBy,
            sdg: sdgId,
        },
        {
            skipNulls: true,
        },
    );
    return statisticsApi.get<StatisticsResponse>(`${group}/${name}?${searchParams}`).json();
};
