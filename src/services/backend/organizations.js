import { url as backendURL } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest, submitPatchRequest } from 'network';

export const organizationsUrl = `${backendURL}organizations/`;

export const getAllOrganizations = () => submitGetRequest(`${organizationsUrl}`);

export const getOrganization = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);
export const getOrganizationLogoUrl = id => `${organizationsUrl}${encodeURIComponent(id)}/logo`;
export const createOrganization = (organization_name, organization_logo, created_by, url, display_id, type) =>
    submitPostRequest(
        organizationsUrl,
        { 'Content-Type': 'application/json' },
        { organization_name, organization_logo, created_by, url, display_id, type },
    );

export const updateOrganization = (id, { name, url, type, logo }) => {
    const formData = new FormData();
    if (logo) formData.append('logo', logo);
    if (name || url || type) {
        const _properties = {};
        if (name) _properties.name = name;
        if (url) _properties.url = url;
        if (type) _properties.type = type;
        formData.append(
            'properties',
            new Blob([JSON.stringify(_properties)], {
                type: 'application/json',
            }),
        );
    }
    return submitPatchRequest(`${organizationsUrl}${encodeURIComponent(id)}`, {}, formData, false);
};

export const updateOrganizationType = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/type`, { 'Content-Type': 'application/json' }, { value });

export const updateConferenceDate = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/date`, { 'Content-Type': 'application/json' }, { value });

export const updateConferenceProcess = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/process`, { 'Content-Type': 'application/json' }, { value });

export const getAllObservatoriesByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);

export const getUsersByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);

export const getComparisonsByOrganizationId = (id, page, size = 10) =>
    submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/comparisons/?page=${page}&size=${size}`);

export const getConferences = () => submitGetRequest(`${organizationsUrl}conferences`);

export const getProblemsByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/problems`);
