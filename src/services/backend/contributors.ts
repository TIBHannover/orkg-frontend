import { url } from 'constants/misc';
import { env } from 'next-runtime-env';
import backendApi from 'services/backend/backendApi';
import { Contributor } from 'services/backend/types';

export const contributorsUrl = `${url}contributors/`;
export const contributorsApi = backendApi.extend(() => ({ prefixUrl: contributorsUrl }));
export const authenticationUrl = env('NEXT_PUBLIC_BACKEND_URL');

export const getContributorInformationById = (contributorsId: string) => contributorsApi.get<Contributor>(contributorsId).json();
