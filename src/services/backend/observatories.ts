import { MISC } from 'constants/graphSettings';
import { url as baseUrl } from 'constants/misc';
import qs from 'qs';
import backendApi from 'services/backend/backendApi';
import { getOrganization, getOrganizationLogoUrl } from 'services/backend/organizations';
import { getResource } from 'services/backend/resources';
import { Contributor, FilterConfig, Observatory, PaginatedResponse, PaginationParams } from 'services/backend/types';

export const observatoriesUrl = `${baseUrl}observatories/`;
export const observatoriesApi = backendApi.extend(() => ({ prefixUrl: observatoriesUrl }));

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
    sortBy = [{ property: 'name', direction: 'asc' }],
}: {
    researchFieldId?: string | null;
    q?: string | null;
} & PaginationParams): Promise<PaginatedResponse<Observatory>> => {
    const sort = sortBy.map(({ property, direction }) => `${property},${direction}`).join(',');
    const searchParams = qs.stringify(
        { research_field: researchFieldId ? encodeURIComponent(researchFieldId) : null, q, page, size, sort },
        {
            skipNulls: true,
        },
    );
    return observatoriesApi
        .get<PaginatedResponse<Observatory>>('', {
            searchParams,
        })
        .json();
};

export const getResearchFieldOfObservatories = ({ page = 0, size = 9999 }: { page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return observatoriesApi
        .get<PaginatedResponse<{ id: string; label: string }>>('research-fields', {
            searchParams,
        })
        .json();
};

export const getObservatoryById = async (id: string) => {
    // the backend only returns the SDG ids, so we need to fetch the resources to get the labels
    const response: Omit<Observatory, 'sdgs'> & {
        sdgs: string[];
    } = await observatoriesApi.get<Observatory>(`${encodeURIComponent(id)}`).json();
    const sdgsPromises = response.sdgs.map((sdgId) =>
        getResource(sdgId).then((resource) => ({
            id: resource.id,
            label: resource.label,
        })),
    );
    return Promise.all(sdgsPromises).then((sdgs) => ({
        ...response,
        sdgs,
    }));
};

export const updateObservatory = (
    id: string,
    {
        name,
        description,
        research_field,
        sdgs,
        organizations,
    }: {
        name?: string | undefined;
        description?: string | undefined;
        research_field?: string | undefined;
        sdgs?: string[] | undefined;
        organizations?: string[] | undefined;
    },
) =>
    observatoriesApi
        .patch<void>(encodeURIComponent(id), {
            json: {
                ...(name && { name }),
                ...(organizations && { organizations }),
                ...(description && { description }),
                ...(research_field && { research_field }),
                ...(sdgs && { sdgs }),
            },
        })
        .json();

export const getUsersByObservatoryId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return observatoriesApi
        .get<PaginatedResponse<Contributor>>(`${encodeURIComponent(id)}/users`, {
            searchParams,
        })
        .json();
};

export const createObservatory = ({
    observatory_name,
    organization_id,
    description,
    research_field,
    display_id,
}: {
    observatory_name: string;
    organization_id: string;
    description: string;
    research_field: string;
    display_id: string;
}) => observatoriesApi.post<Observatory>('', { json: { observatory_name, organization_id, description, research_field, display_id } }).json();

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
            .then((obsResponse) => {
                if (organizationId !== MISC.UNKNOWN_ID) {
                    return getOrganization(organizationId)
                        .then((orgResponse) => ({
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
            .then((orgResponse) => ({
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

/**
 * Get the list of filters for the observatory
 *
 * @param {String} id observatory id
 * @return {Array} List of filters
 */
export const getFiltersByObservatoryId = ({ id, page = 0, items = 9999 }: { id: string; page?: number; items?: number }) => {
    const params = qs.stringify(
        { page, size: items },
        {
            skipNulls: true,
        },
    );
    return observatoriesApi
        .get<PaginatedResponse<FilterConfig>>(`${encodeURIComponent(id)}/filters`, {
            searchParams: `${params}&sort=featured,desc&sort=label,asc`,
        })
        .json()
        .then((r) => r.content);
};

/**
 * create filter in observatory
 */
export const createFiltersInObservatory = (id: string, { label, path, range, featured, exact }: FilterConfig) =>
    observatoriesApi.post<void>(`${encodeURIComponent(id)}/filters`, { json: { label, path, range, featured, exact } }).json();

/**
 * update filter in observatory
 */
export const updateFiltersOfObservatory = (observatoryId: string, filterId: string, { label, path, range, featured, exact }: FilterConfig) =>
    observatoriesApi
        .patch<void>(`${encodeURIComponent(observatoryId)}/filters/${filterId}`, {
            json: { label, path, range, featured, exact },
        })
        .json();

/**
 * Delete a filter from an observatory
 *
 * @param {String} observatoryId observatory id
 * @param {String} filterId filter id
 */
export const deleteFilterOfObservatory = (observatoryId: string, filterId: string) =>
    observatoriesApi.delete<void>(`${encodeURIComponent(observatoryId)}/filters/${filterId}`).json();
