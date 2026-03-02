import { ContributorsApi, ContributorsApiFindAllRequest } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';

export const contributorsUrl = `${urlNoTrailingSlash}/contributors`;
const contributorsApi = new ContributorsApi(configuration);

export const getContributorById = (contributorsId: string) => contributorsApi.findById({ id: contributorsId });

export const getContributors = (params: ContributorsApiFindAllRequest) => contributorsApi.findAll(params);
