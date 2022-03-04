import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

export const contributorsUrl = `${url}contributors/`;
export const authenticationUrl = env('BACKEND_URL');

export const getContributorInformationById = contributorsId => {
    return submitGetRequest(`${contributorsUrl}` + contributorsId, {}, true);
};
