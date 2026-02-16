import {
    AuthorStatisticsApi,
    AuthorStatisticsApiFindAllByResearchProblemIdRequest,
    ContributorStatisticsApi,
    ContributorStatisticsApiFindAllByResearchProblemIdRequest,
    ResearchProblemsApi,
    ResearchProblemsApiFindAllRequest,
} from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';

// remove the trailing slash, can be removed when the .env file is updated to remove the trailing slash
export const researchProblemsUrl = `${urlNoTrailingSlash}/research-problems`;

const researchProblemsApi = new ResearchProblemsApi(configuration);

const authorStatisticsApi = new AuthorStatisticsApi(configuration);

const contributorsApi = new ContributorStatisticsApi(configuration);

export const getAuthorStatisticsByResearchProblemId = (params: AuthorStatisticsApiFindAllByResearchProblemIdRequest) =>
    authorStatisticsApi.findAllByResearchProblemId(params);

export const getContributorsByResearchProblemId = (params: ContributorStatisticsApiFindAllByResearchProblemIdRequest) =>
    contributorsApi.findAllByResearchProblemId(params);

export const getResearchProblems = (params: ResearchProblemsApiFindAllRequest) => researchProblemsApi.findAll(params);
