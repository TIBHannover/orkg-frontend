import { MISC } from 'constants/graphSettings';
import { url } from 'constants/misc';
import qs from 'qs';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import { getOrganization } from 'services/backend/organizations';
import { getOrganizationLogoUrl } from 'services/backend/organizations';

export const observatoriesUrl = `${url}observatories/`;

export const getAllObservatories = () => submitGetRequest(`${observatoriesUrl}`);

export const getObservatoryById = id => submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/`);

export const updateObservatoryName = (id, value) =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/name`, { 'Content-Type': 'application/json' }, { value });

export const updateObservatoryDescription = (id, value) =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/description`, { 'Content-Type': 'application/json' }, { value });

export const updateObservatoryResearchField = (id, value) =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/research_field`, { 'Content-Type': 'application/json' }, { value });

export const getUsersByObservatoryId = id => submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/users`);

export const addOrganizationToObservatory = (id, organization_id) =>
    submitPutRequest(`${observatoriesUrl}add/${encodeURIComponent(id)}/organization`, { 'Content-Type': 'application/json' }, { organization_id });

export const deleteOrganizationFromObservatory = (id, organization_id) =>
    submitPutRequest(`${observatoriesUrl}delete/${encodeURIComponent(id)}/organization`, { 'Content-Type': 'application/json' }, { organization_id });

export const getResourcesByObservatoryId = id => submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/papers`);

export const getComparisonsByObservatoryId = id => submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/comparisons`);

export const getContentByObservatoryIdAndClasses = ({
    id,
    page = 0,
    items = 9999,
    sortBy = 'created_at',
    desc = true,
    featured = null,
    unlisted = null,
    classes = [],
}) => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size: items, sort, featured, unlisted, classes: classes.join(',') },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/class?${params}`);
};

export const getObservatoriesByResearchFieldId = id => submitGetRequest(`${observatoriesUrl}research-field/${encodeURIComponent(id)}/observatories`);

export const getObservatoriesStats = id => submitGetRequest(`${observatoriesUrl}stats/observatories`);

export const createObservatory = (observatory_name, organization_id, description, research_field, display_id) =>
    submitPostRequest(
        observatoriesUrl,
        { 'Content-Type': 'application/json' },
        { observatory_name, organization_id, description, research_field, display_id },
    );

export const getObservatoryAndOrganizationInformation = (observatoryId, organizationId) => {
    if (observatoryId && observatoryId !== MISC.UNKNOWN_ID) {
        return getObservatoryById(observatoryId)
            .then(obsResponse => {
                if (organizationId !== MISC.UNKNOWN_ID) {
                    return getOrganization(organizationId)
                        .then(orgResponse => ({
                            id: observatoryId,
                            name: obsResponse.name,
                            display_id: obsResponse.display_id,
                            organization: {
                                id: organizationId,
                                name: orgResponse.name,
                                logo: getOrganizationLogoUrl(orgResponse.id),
                                display_id: orgResponse.display_id,
                                type: orgResponse.type,
                            },
                        }))
                        .catch(() => ({
                            id: observatoryId,
                            name: obsResponse.name,
                            display_id: obsResponse.display_id,
                            organization: null,
                        }));
                }
                return {
                    id: observatoryId,
                    name: obsResponse.name,
                    display_id: obsResponse.display_id,
                    organization: null,
                };
            })
            .catch(() => Promise.resolve(null));
    }
    if (organizationId && organizationId !== MISC.UNKNOWN_ID) {
        return getOrganization(organizationId)
            .then(orgResponse => ({
                id: null,
                name: null,
                display_id: null,
                organization: {
                    id: organizationId,
                    name: orgResponse.name,
                    logo: getOrganizationLogoUrl(orgResponse.id),
                    display_id: orgResponse.display_id,
                    type: orgResponse.type,
                },
            }))
            .catch(() => Promise.resolve(null));
    }
    return Promise.resolve(null);
};
