import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';

export const organizationsUrl = `${url}organizations/`;

export const getAllOrganizations = () => {
    return submitGetRequest(`${organizationsUrl}`);
};

export const getOrganization = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);
};

export const createOrganization = (organizationName, organizationLogo, createdBy, url) => {
    return submitPostRequest(organizationsUrl, { 'Content-Type': 'application/json' }, { organizationName, organizationLogo, createdBy, url });
};

export const getAllObservatoriesByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);
};

export const getUsersByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);
};
