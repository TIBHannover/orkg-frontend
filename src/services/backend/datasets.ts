import {
    DatasetsApi,
    DatasetsApiFindAllDatasetsByResearchProblemIdRequest,
    DatasetsApiFindAllDatasetSummariesByIdAndResearchProblemIdRequest,
    DatasetsApiFindAllResearchProblemsByDatasetIdRequest,
} from '@orkg/orkg-client';
import { sortBy } from 'lodash';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';

const datasetsApiClient = new DatasetsApi(configuration);

export const datasetsUrl = `${urlNoTrailingSlash}/datasets`;

// The services defined here were discussed in the following issue
// https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263

export const findAllDatasetSummariesByIdAndResearchProblemId = ({
    id,
    researchProblemId,
    page = 0,
    size = 9999,
}: DatasetsApiFindAllDatasetSummariesByIdAndResearchProblemIdRequest) => {
    return datasetsApiClient.findAllDatasetSummariesByIdAndResearchProblemId({
        id,
        researchProblemId,
        page,
        size,
        sort: sortBy(sortBy, ['paper_year', 'paper_month']),
    });
};

export const getResearchProblemsByDatasetId = ({ id, page = 0, size = 9999 }: DatasetsApiFindAllResearchProblemsByDatasetIdRequest) => {
    return datasetsApiClient.findAllResearchProblemsByDatasetId({
        id,
        page,
        size,
    });
};

export const findAllDatasetsByResearchProblemId = ({
    id,
    page = 0,
    size = 9999,
    sort = ['totalPapers,desc', 'totalModels,desc', 'totalCodes,desc', 'dataset.label,asc'],
}: DatasetsApiFindAllDatasetsByResearchProblemIdRequest) => {
    return datasetsApiClient.findAllDatasetsByResearchProblemId({
        id,
        page,
        size,
        sort,
    });
};
