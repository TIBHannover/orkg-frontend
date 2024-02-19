import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { getOrganization, getOrganizationLogoUrl } from 'services/backend/organizations';
import { Contributor, Observatory, PaginatedResponse, Resource } from 'services/backend/types';

export const observatoriesUrl = `${url}observatories/`;

/**
 * Get Observatories (400 BAD REQUEST if both q and research_field are specified)
 * @param {String} researchFieldId Research field id
 * @param {String} q Search query
 * @param {Number} page Page number
 * @param {Number} size Number of items per page
 * @return {Object} List of observatories
 */
export const getObservatories = ({
    researchFieldId = null,
    q = null,
    page = 0,
    size = 9999,
}: {
    researchFieldId?: string | null;
    q?: string | null;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<Observatory>> => {
    const params = qs.stringify(
        { research_field: researchFieldId ? encodeURIComponent(researchFieldId) : null, q, page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}?${params}`);
};

export const getResearchFieldOfObservatories = ({
    page = 0,
    size = 9999,
}: {
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<{ id: string; label: string }>> => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}research-fields/?${params}`);
};

export const getObservatoryById = (id: string): Promise<Observatory> => submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/`);

export const updateObservatoryName = (id: string, value: string): Promise<Observatory> =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/name`, { 'Content-Type': 'application/json' }, { value });

export const updateObservatoryDescription = (id: string, value: string): Promise<Observatory> =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/description`, { 'Content-Type': 'application/json' }, { value });

export const updateObservatoryResearchField = (id: string, value: string): Promise<Observatory> =>
    submitPutRequest(`${observatoriesUrl}${encodeURIComponent(id)}/research_field`, { 'Content-Type': 'application/json' }, { value });

export const getUsersByObservatoryId = ({
    id,
    page = 0,
    size = 9999,
}: {
    id: string;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<Contributor>> => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/users?${params}`);
};

export const addOrganizationToObservatory = (id: string, organization_id: string): Promise<Observatory> =>
    submitPutRequest(`${observatoriesUrl}add/${encodeURIComponent(id)}/organization`, { 'Content-Type': 'application/json' }, { organization_id });

export const deleteOrganizationFromObservatory = (id: string, organization_id: string): Promise<Observatory> =>
    submitPutRequest(`${observatoriesUrl}delete/${encodeURIComponent(id)}/organization`, { 'Content-Type': 'application/json' }, { organization_id });

export const getContentByObservatoryIdAndClasses = ({
    id,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    classes = [],
}: {
    id: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    visibility?: string;
    classes?: string[];
}): Promise<PaginatedResponse<Resource>> => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort, visibility, classes: classes.join(',') },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/class?${params}`);
};

export const createObservatory = (
    observatory_name: string,
    organization_id: string,
    description: string,
    research_field: string,
    display_id: string,
): Promise<Observatory> =>
    submitPostRequest(
        observatoriesUrl,
        { 'Content-Type': 'application/json' },
        { observatory_name, organization_id, description, research_field, display_id },
    );

export const getObservatoryAndOrganizationInformation = (
    observatoryId: string,
    organizationId: string,
): Promise<{
    id: string | null;
    name: string | null;
    display_id: string | null;
    organization: {
        id: string;
        name: any;
        logo: string;
        display_id: any;
        type: any;
    } | null;
} | null> => {
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
