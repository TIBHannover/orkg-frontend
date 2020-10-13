import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';
import { getOrganization } from 'services/backend/organizations';

export const observatoriesUrl = `${url}observatories/`;

export const getObservatoryById = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/`);
};

export const getUsersByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/users`);
};

export const getResourcesByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/papers`);
};

export const getComparisonsByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/comparisons`);
};

export const getProblemsByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/problems`);
};

export const createObservatory = (observatoryName, organizationId, description) => {
    return submitPostRequest(observatoriesUrl, { 'Content-Type': 'application/json' }, { observatoryName, organizationId, description });
};

export const getObservatoryAndOrganizationInformation = (observatoryId, organizationId) => {
    return getObservatoryById(observatoryId).then(obsResponse => {
        return getOrganization(organizationId).then(orgResponse => {
            return {
                id: observatoryId,
                name: obsResponse.name,
                organization: {
                    id: organizationId,
                    name: orgResponse.name,
                    logo: orgResponse.logo
                }
            };
        });
    });
};
