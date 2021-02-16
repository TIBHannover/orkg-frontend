import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import { getOrganization } from 'services/backend/organizations';

export const observatoriesUrl = `${url}observatories/`;

export const getAllObservatories = () => {
    return submitGetRequest(`${observatoriesUrl}`);
};

export const getObservatoryById = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/`);
};

export const updateObservatoryName = (id, value) => {
    return submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/name`, { 'Content-Type': 'application/json' }, { value });
};

export const updateObservatoryDescription = (id, value) => {
    return submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/description`, { 'Content-Type': 'application/json' }, { value });
};

export const updateObservatoryResearchField = (id, value) => {
    return submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/research_field`, { 'Content-Type': 'application/json' }, { value });
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

export const getObservatoriesByResearchFieldId = id => {
    return submitGetRequest(`${observatoriesUrl}research-field/${encodeURIComponent(id)}/observatories`);
};

export const getObservatoriesStats = id => {
    return submitGetRequest(`${observatoriesUrl}stats/observatories`);
};

export const createObservatory = (observatoryName, organizationId, description, researchField, uriName) => {
    return submitPostRequest(
        observatoriesUrl,
        { 'Content-Type': 'application/json' },
        { observatoryName, organizationId, description, researchField, uriName }
    );
};

export const getObservatoryAndOrganizationInformation = (observatoryId, organizationId) => {
    return getObservatoryById(observatoryId).then(obsResponse => {
        if (organizationId !== '00000000-0000-0000-0000-000000000000') {
            return getOrganization(organizationId)
                .then(orgResponse => {
                    return {
                        id: observatoryId,
                        name: obsResponse.name,
                        organization: {
                            id: organizationId,
                            name: orgResponse.name,
                            logo: orgResponse.logo
                        }
                    };
                })
                .catch(() => {
                    return {
                        id: observatoryId,
                        name: obsResponse.name,
                        organization: null
                    };
                });
        } else {
            return {
                id: observatoryId,
                name: obsResponse.name,
                organization: null
            };
        }
    });
};
