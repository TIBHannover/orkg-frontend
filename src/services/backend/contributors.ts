import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { Contributor, PaginatedResponse } from '@/services/backend/types';

export const contributorsUrl = `${url}contributors/`;
export const contributorsApi = backendApi.extend(() => ({ prefixUrl: contributorsUrl }));

export const getContributorInformationById = (contributorsId: string) => contributorsApi.get<Contributor>(contributorsId).json();

export const getContributors = (params: { page: number; size: number; q: string }) =>
    contributorsApi.get<PaginatedResponse<Contributor>>('', { searchParams: params }).json();
