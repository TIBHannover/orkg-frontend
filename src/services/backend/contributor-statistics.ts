import {
    ContributorStatisticsApi,
    ContributorStatisticsApiFindAllByResearchFieldIdRequest,
    ContributorStatisticsApiFindAllRequest,
} from '@orkg/orkg-client';

import { RESOURCES } from '@/constants/graphSettings';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';

// remove the trailing slash, can be removed when the .env file is updated to remove the trailing slash
export const contributorStatisticsUrl = `${urlNoTrailingSlash}/contributor-statistics`;

const contributorStatisticsApi = new ContributorStatisticsApi(configuration);

export const getContributorStatistics = (params: ContributorStatisticsApiFindAllRequest) => contributorStatisticsApi.findAll(params);

export const getContributorStatisticsByResearchFieldId = (params: ContributorStatisticsApiFindAllByResearchFieldIdRequest) => {
    if (params.id === RESOURCES.RESEARCH_FIELD_MAIN) {
        return getContributorStatistics(params);
    }
    return contributorStatisticsApi.findAllByResearchFieldId(params);
};
