import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';
import { getOrganization } from './organizations';

export const conferenceSeriesUrl = `${url}conference-series/`;

export const createConference = (organization_id, name, url, display_id, metadata) =>
    submitPostRequest(`${conferenceSeriesUrl}`, { 'Content-Type': 'application/json' }, { organization_id, name, display_id, url, metadata });

export const getConferencesSeries = () => submitGetRequest(`${conferenceSeriesUrl}`);

export const getSeriesListByConferenceId = id => submitGetRequest(`${conferenceSeriesUrl}${encodeURIComponent(id)}/series`);

export const getConferenceById = id => submitGetRequest(`${conferenceSeriesUrl}${encodeURIComponent(id)}/`);

export const getConferenceAndOrganizationInformation = organizationId =>
    getConferenceById(organizationId)
        .then(async confResponse => {
            try {
                const orgResponse = await getOrganization(confResponse.organizationId);
                return {
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
                };
            } catch {
                return {
                    id: organizationId,
                    name: confResponse.name,
                    display_id: confResponse.display_id,
                    metadata: confResponse,
                    organization: null,
                };
            }
        })
        .catch(() => null);
