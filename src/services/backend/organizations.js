import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';

export const organizationsUrl = `${url}organizations/`;

export const getAllOrganizations = () => submitGetRequest(`${organizationsUrl}`);

export const getOrganization = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);

export const createOrganization = (organization_name, organization_logo, created_by, url, display_id, type) =>
    submitPostRequest(
        organizationsUrl,
        { 'Content-Type': 'application/json' },
        { organization_name, organization_logo, created_by, url, display_id, type },
    );

export const updateOrganizationName = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/name`, { 'Content-Type': 'application/json' }, { value });

export const updateOrganizationUrl = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/url`, { 'Content-Type': 'application/json' }, { value });

export const updateOrganizationLogo = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/logo`, { 'Content-Type': 'application/json' }, { value });

export const updateOrganizationType = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/type`, { 'Content-Type': 'application/json' }, { value });

export const updateConferenceDate = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/date`, { 'Content-Type': 'application/json' }, { value });

export const updateConferenceProcess = (id, value) =>
    submitPutRequest(`${organizationsUrl}${encodeURIComponent(id)}/process`, { 'Content-Type': 'application/json' }, { value });

export const getAllObservatoriesByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);

export const getUsersByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);

export const getComparisonsByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/comparisons`);

export const getConferences = () => submitGetRequest(`${organizationsUrl}conferences`);

export const getProblemsByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/problems`);
