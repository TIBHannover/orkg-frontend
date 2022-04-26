import { MISC } from 'constants/graphSettings';
import { url } from 'constants/misc';
import queryString from 'query-string';
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

export const getContentByObservatoryIdAndClasses = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    featured = null,
    unlisted = null,
    classes = []
}) => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page: page, size: items, sort, featured, unlisted, classes: classes.join(',') },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/class?${params}`);
};

export const getObservatoriesByResearchFieldId = id => {
    return submitGetRequest(`${observatoriesUrl}research-field/${encodeURIComponent(id)}/observatories`);
};

export const getObservatoriesStats = id => {
    return submitGetRequest(`${observatoriesUrl}stats/observatories`);
};

export const createObservatory = (observatory_name, organization_id, description, research_field, display_id) => {
    return submitPostRequest(
        observatoriesUrl,
        { 'Content-Type': 'application/json' },
        { observatory_name, organization_id, description, research_field, display_id }
    );
};

export const getObservatoryAndOrganizationInformation = (observatoryId, organizationId) => {
    return getObservatoryById(observatoryId)
        .then(obsResponse => {
            if (organizationId !== MISC.UNKNOWN_ID) {
                return getOrganization(organizationId)
                    .then(orgResponse => {
                        return {
                            id: observatoryId,
                            name: obsResponse.name,
                            display_id: obsResponse.display_id,
                            organization: {
                                id: organizationId,
                                name: orgResponse.name,
                                logo: orgResponse.logo,
                                display_id: orgResponse.display_id,
                                metadata: orgResponse.metadata
                            }
                        };
                    })
                    .catch(() => {
                        return {
                            id: observatoryId,
                            name: obsResponse.name,
                            display_id: obsResponse.display_id,
                            organization: null
                        };
                    });
            } else {
                return {
                    id: observatoryId,
                    name: obsResponse.name,
                    display_id: obsResponse.display_id,
                    organization: null
                };
            }
        })
        .catch(() => {
            return null;
        });
};
