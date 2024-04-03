'use client';

import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { uniq, uniqBy } from 'lodash';
import { submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { classesUrl } from 'services/backend/classes';
import { getContributorInformationById } from 'services/backend/contributors';
import { PaginatedResponse, Resource, SortByOptions, VisibilityFilter } from 'services/backend/types';

export const resourcesUrl = `${url}resources/`;

export const updateResource = (id: string, label?: string, classes: string[] | null = null, extractionMethod?: string): Promise<Resource> =>
    submitPutRequest(
        `${resourcesUrl}${id}`,
        { 'Content-Type': 'application/json' },
        { ...(label ? { label } : null), ...(classes ? { classes } : null), ...(extractionMethod ? { extraction_method: extractionMethod } : null) },
    );

/* Can be replaced with updateResource */
export const updateResourceClasses = (id: string, classes: string[] | null = null): Promise<Resource> =>
    submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { ...(classes ? { classes } : null) });

export const createResource = (label: string, classes: string[] = [], id: string | undefined = undefined): Promise<Resource> =>
    submitPostRequest(resourcesUrl, { 'Content-Type': 'application/json' }, { label, classes, id });

export const getResource = (id: string): Promise<Resource> => submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/`);

export const getResourcesByIds = (ids: string[]): Promise<Resource[]> => Promise.all(ids.map(id => getResource(id)));

export const deleteResource = (id: string): Promise<null> => submitDeleteRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' });

/**
 * Fetches resources based on various filter and sorting criteria.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string|null} [params.q=null] - Query string for searching resources.
 * @param {boolean} [params.exact=false] - Flag for exact match in search.
 * @param {VisibilityFilter} [params.visibility=VISIBILITY_FILTERS.ALL_LISTED] - Filter for resource visibility.
 * @param {string|null} [params.createdBy=null] - Filter for the creator of the resources.
 * @param {string|null} [params.createdAtStart=null] - Start date for creation date filter. eg: 2023-11-30T08:25:14.049085776+01:00
 * @param {string|null} [params.createdAtEnd=null] - End date for creation date filter. eg: 2023-11-30T10:25:14.049085776+01:00
 * @param {string[]} [params.include=[]] - Filter for a set of classes that the resource must have.
 * @param {string[]} [params.exclude=[]] - Filter for a set of classes that the resource must not have.
 * @param {string|null} [params.observatoryId=null] - Filter for resources by observatory ID.
 * @param {string|null} [params.organizationId=null] - Filter for resources by organization ID.
 * @param {number} [params.page=0] - Page number for pagination.
 * @param {number} [params.size=9999] - Number of items per page.
 * @param {SortByOptions} [params.sortBy='created_at'] - The field to sort by.
 * @param {boolean} [params.desc=true] - Specifies descending order if true.
 * @param {boolean} [params.returnContent=false] - Flag to return only content field in response.
 * @returns {Promise<PaginatedResponse<Resource> | Resource[]>} A promise to the resource data.
 */
export const getResources = ({
    q = null,
    exact = false,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    createdBy = null,
    createdAtStart = null,
    createdAtEnd = null,
    include = [],
    exclude = [],
    observatoryId = null,
    organizationId = null,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    baseClass = null,
    returnContent = false,
}: {
    q?: string | null;
    exact?: boolean;
    visibility?: VisibilityFilter;
    createdBy?: string | null;
    createdAtStart?: string | null;
    createdAtEnd?: string | null;
    include?: string[];
    exclude?: string[];
    observatoryId?: string | null;
    organizationId?: string | null;
    page?: number;
    size?: number;
    sortBy?: SortByOptions;
    desc?: boolean;
    baseClass?: string | null;
    returnContent?: boolean;
}): Promise<PaginatedResponse<Resource> | Resource[]> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        {
            page,
            size,
            ...(q ? { q, exact } : { sort, desc }),
            visibility,
            created_by: createdBy,
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
            ...(baseClass ? { base_class: baseClass } : {}),
            ...(include?.length ? { include: include.join(',') } : {}),
            ...(exclude?.length ? { exclude: exclude.join(',') } : {}),
            observatory_id: observatoryId,
            organization_id: organizationId,
        },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${resourcesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};

export const getContributorsByResourceId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/contributors?${params}`).then(
        async (contributors: PaginatedResponse<string>) => {
            const uniqContributors = uniq(contributors.content);
            const uniqContributorsInfosRequests = uniqContributors.map(contributor =>
                contributor === MISC.UNKNOWN_ID
                    ? { id: MISC.UNKNOWN_ID, display_name: 'Unknown' }
                    : getContributorInformationById(contributor).catch(() => ({ id: contributor, display_name: 'User not found' })),
            );
            const uniqContributorsInfos = await Promise.all(uniqContributorsInfosRequests);
            return {
                ...contributors,
                content: contributors.content.map(u => uniqContributorsInfos.find(i => u === i.id)),
            };
        },
    );
};

export const getTimelineByResourceId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/timeline?${params}`).then(
        async (contributors: PaginatedResponse<{ created_by: string; created_at: string }>) => {
            const uniqContributors = uniqBy(contributors.content, 'created_by');
            const uniqContributorsInfosRequests = uniqContributors.map(contributor =>
                contributor.created_by === MISC.UNKNOWN_ID
                    ? { id: MISC.UNKNOWN_ID, display_name: 'Unknown' }
                    : getContributorInformationById(contributor.created_by).catch(() => ({
                          id: contributor.created_by,
                          display_name: 'User not found',
                      })),
            );
            const uniqContributorsInfos = await Promise.all(uniqContributorsInfosRequests);
            return {
                ...contributors,
                content: contributors.content.map(u => ({ ...u, created_by: uniqContributorsInfos.find(i => u.created_by === i.id) })),
            };
        },
    );
};

export const addResourceToObservatory = ({
    observatory_id,
    organization_id,
    id,
}: {
    observatory_id: string;
    organization_id: string;
    id: string;
}): Promise<null> =>
    submitPutRequest(`${resourcesUrl}${id}/observatory`, { 'Content-Type': 'application/json' }, { observatory_id, organization_id });

export const getPapers = async ({
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    verified = null,
    returnContent = false,
}: {
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    verified?: boolean | null;
    returnContent?: boolean;
}): Promise<PaginatedResponse<Resource> | Resource[]> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort, desc, verified },
        {
            skipNulls: true,
        },
    );

    const resources = await submitGetRequest(`${classesUrl}Paper/resources/?${params}`).then(res => (returnContent ? res.content : res));
    return resources;
};

export const markAsFeatured = (id: string): Promise<null> =>
    submitPutRequest(`${resourcesUrl}${id}/metadata/featured`, { 'Content-Type': 'application/json' });

export const removeFeaturedFlag = (id: string): Promise<null> =>
    submitDeleteRequest(`${resourcesUrl}${id}/metadata/featured`, { 'Content-Type': 'application/json' });

export const markAsUnlisted = (id: string): Promise<null> =>
    submitPutRequest(`${resourcesUrl}${id}/metadata/unlisted`, { 'Content-Type': 'application/json' });

export const removeUnlistedFlag = (id: string): Promise<null> =>
    submitDeleteRequest(`${resourcesUrl}${id}/metadata/unlisted`, { 'Content-Type': 'application/json' });
