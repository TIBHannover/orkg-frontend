import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import env from 'components/NextJsMigration/env';
import { Contributor } from 'services/backend/types';

export const contributorsUrl = `${url}contributors/`;
export const authenticationUrl = env('BACKEND_URL');

export const getContributorInformationById = (contributorsId: string): Promise<Contributor> =>
    submitGetRequest(`${contributorsUrl}${contributorsId}`, {}, true);
