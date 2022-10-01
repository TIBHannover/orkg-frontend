import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';

export const organizationsUrl = `${url}organizations/`;
export const conferenceSeriesUrl = `${url}conferences-series/`;

export const getAllOrganizations = () => submitGetRequest(`${organizationsUrl}`);

export const getOrganization = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);

export const createOrganization = (organization_name, organization_logo, created_by, url, display_id, type) =>
    submitPostRequest(
        organizationsUrl,
        { 'Content-Type': 'application/json' },
        { organization_name, organization_logo, created_by, url, display_id, type },
    );

export const createConference = (organization_id, name, url, display_id, metadata) =>
    submitPostRequest(
        `${conferenceSeriesUrl}`,
        { 'Content-Type': 'application/json' },
        { organization_id, name, display_id, url, metadata },
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

export const getConferencesSeries = () => submitGetRequest(`${conferenceSeriesUrl}`);

export const getConferences = () => submitGetRequest(`${organizationsUrl}conferences`);

export const getSeriesListByConferenceId = id => submitGetRequest(`${conferenceSeriesUrl}${encodeURIComponent(id)}/series`);

// export const getConferenceById = id => submitGetRequest(`${organizationsUrl}conference?/doi=${encodeURIComponent(id)}`);

export const getConferenceById = id => submitGetRequest(`${conferenceSeriesUrl}${encodeURIComponent(id)}/`);

export const getComparisonsByOrganizationId = id => submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/comparisons`);

export const getConferenceAndOrganizationInformation = organizationId =>
    getConferenceById(organizationId)
        .then(async confResponse => {
                try {
                const orgResponse = await getOrganization(confResponse.organizationId);
                return ({
                    name: confResponse.name,
                    display_id: confResponse.display_id,
                    metadata: confResponse.metadata,
                    organization: {
                        id: confResponse.organizationId,
                        name: orgResponse.name,
                        logo: orgResponse.logo,
                        display_id: orgResponse.display_id,
                        type: orgResponse.type,
                    },
                });
            } catch {
                return ({
                    id: organizationId,
                    name: confResponse.name,
                    display_id: confResponse.display_id,
                    metadata: confResponse,
                    organization: null,
                });
            }
        })
        .catch(() => null);
