import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import { url as baseUrl } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPatchRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { mergePaginateResponses } from 'services/backend/misc';
import { getOrganization, getOrganizationLogoUrl } from 'services/backend/organizations';
import { Contributor, FilterConfig, Observatory, PaginatedResponse, Resource, SortByOptions, VisibilityOptions } from 'services/backend/types';

export const observatoriesUrl = `${baseUrl}observatories/`;

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

export type GetContentByObservatoryIdParams = {
    id: string;
    page?: number;
    size?: number;
    sortBy?: SortByOptions;
    desc?: boolean;
    visibility?: VisibilityOptions;
    classes?: string[];
    filters?: FilterConfig[];
};

/**
 * Get content of an observatory
 * @param {String} id observatory id
 * @param {Number} page Page number
 * @param {Number} size Number of items per page
 * @param {SortByOptions} sortBy Sort field
 * @param {Boolean} desc  ascending order and descending order.
 * @param {VisibilityOptions} visibility Visibility of paper
 * @param {string[]} classes Classes IDs Filter
 * @param {FilterConfig} filters The filter config to use
 * @return {Promise} Promise of paginated list of resources
 */
export const getContentByObservatoryId = ({
    id,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    classes = [],
    filters = [],
}: GetContentByObservatoryIdParams): Promise<PaginatedResponse<Resource>> => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const url = filters.length > 0 ? `${observatoriesUrl}${encodeURIComponent(id)}/papers?` : `${observatoriesUrl}${encodeURIComponent(id)}/class?`;
    const paramsObj = { page, size, sort, visibility, classes: classes.join(','), filter_config: JSON.stringify(filters) };
    if (visibility === VISIBILITY_FILTERS.TOP_RECENT) {
        const paramsFeaturedObj = qs.stringify({ ...paramsObj, visibility: VISIBILITY_FILTERS.FEATURED }, { skipNulls: true });
        const paramsNoFeaturedObj = qs.stringify({ ...paramsObj, visibility: VISIBILITY_FILTERS.NON_FEATURED }, { skipNulls: true });
        return Promise.all([submitGetRequest(url + paramsFeaturedObj), submitGetRequest(url + paramsNoFeaturedObj)]).then(([featured, noFeatured]) =>
            mergePaginateResponses(featured, noFeatured),
        );
    }
    const params = qs.stringify(paramsObj, { skipNulls: true });
    return submitGetRequest(url + params);
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
export const getFiltersByObservatoryId = ({ id, page = 0, items = 9999 }: { id: string; page?: number; items?: number }): Promise<FilterConfig[]> => {
    const params = qs.stringify(
        { page, size: items },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/filters/?${params}&sort=featured,desc&sort=label,asc`).then(
        (r) => r.content,
    );
};

/**
 * create filter in observatory
 */
export const createFiltersInObservatory = (id: string, { label, path, range, featured, exact }: FilterConfig) =>
    submitPostRequest(
        `${observatoriesUrl}${encodeURIComponent(id)}/filters/`,
        { 'Content-Type': 'application/json' },
        { label, path, range, featured, exact },
        true,
        true,
        false,
    );

/**
 * update filter in observatory
 */
export const updateFiltersOfObservatory = (observatoryId: string, filterId: string, { label, path, range, featured, exact }: FilterConfig) =>
    submitPatchRequest(
        `${observatoriesUrl}${encodeURIComponent(observatoryId)}/filters/${filterId}`,
        { 'Content-Type': 'application/json' },
        { label, path, range, featured, exact },
    );

/**
 * Delete a filter from an observatory
 *
 * @param {String} observatoryId observatory id
 * @param {String} filterId filter id
 */
export const deleteFilterOfObservatory = (observatoryId: string, filterId: string) =>
    submitDeleteRequest(`${observatoriesUrl}${encodeURIComponent(observatoryId)}/filters/${filterId}`);
