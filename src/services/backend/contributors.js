import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

export const contributorsUrl = `${url}contributors/`;
export const authenticationUrl = env('SERVER_URL');

export const getContributorInformationById = contributorsId => {
    return submitGetRequest(`${contributorsUrl}` + contributorsId, {}, true);
};

export const getContributors = () => {
    return submitGetRequest(`${contributorsUrl}`);
};
