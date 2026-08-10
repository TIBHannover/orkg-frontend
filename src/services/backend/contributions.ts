import { ContributionsApi, CreateContributionRequest } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId } from '@/services/backend/backendApi';

// remove the trailing slash, can be removed when the .env file is updated to remove the trailing slash
export const contributionsUrl = `${urlNoTrailingSlash}/contributions`;

const contributionsApi = new ContributionsApi(configuration);

export const getContribution = (id: string) => contributionsApi.findById({ id });

export const createContribution = (paperId: string, contribution: CreateContributionRequest) =>
    contributionsApi.createRaw({ id: paperId, createContributionRequest: contribution }).then(getCreatedId);
