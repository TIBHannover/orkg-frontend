import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';

export const organizationsUrl = `${url}organizations/`;

export const getAllOrganizations = () => {
    return submitGetRequest(`${organizationsUrl}`);
};

export const getOrganization = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);
};

export const createOrganization = (organization_name, organization_logo, created_by, url, display_id, type) => {
    return submitPostRequest(
        organizationsUrl,
        { 'Content-Type': 'application/json' },
        { organization_name, organization_logo, created_by, url, display_id, type }
    );
};

export const updateOrganizationName = (id, value) => {
    return submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/name`, { 'Content-Type': 'application/json' }, { value });
};

export const updateOrganizationUrl = (id, value) => {
    return submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/url`, { 'Content-Type': 'application/json' }, { value });
};

export const updateOrganizationLogo = (id, value) => {
    return submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/logo`, { 'Content-Type': 'application/json' }, { value });
};

export const updateOrganizationType = (id, value) => {
    return submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/type`, { 'Content-Type': 'application/json' }, { value });
};

export const getAllObservatoriesByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);
};

export const getUsersByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);
};

export const getOrganizationsByType = type => {
    return submitGetRequest(`${organizationsUrl}type/${encodeURIComponent(type)}`);
};
