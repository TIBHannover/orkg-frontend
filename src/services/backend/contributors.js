import { url } from 'constants/misc';
import { submitGetRequest } from 'network';

export const contributorsUrl = `${url}contributors/`;

export const getContributorInformationById = contributorsId => {
    return submitGetRequest(`${contributorsUrl}` + contributorsId, {}, true);
};
