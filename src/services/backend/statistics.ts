import { StatisticsApi, StatisticsApiFindMetricByGroupAndNameRequest } from '@orkg/orkg-client';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';

export const statisticsUrl = `${urlNoTrailingSlash}/statistics`;

const statisticsApi = new StatisticsApi(configuration);

export const getStatistics = (parameters: StatisticsApiFindMetricByGroupAndNameRequest) => {
    if (parameters.parameters?.visibility === VISIBILITY_FILTERS.TOP_RECENT) {
        return statisticsApi.findMetricByGroupAndName({
            ...parameters,
            parameters: {
                ...parameters.parameters,
                visibility: VISIBILITY_FILTERS.ALL_LISTED,
            },
        });
    }
    return statisticsApi.findMetricByGroupAndName(parameters);
};
