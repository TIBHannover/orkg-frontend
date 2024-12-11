'use client';

import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { uniq, uniqBy } from 'lodash';
import qs from 'qs';
import backendApi from 'services/backend/backendApi';
import { getContributorInformationById } from 'services/backend/contributors';
import {
    CreatedByParam,
    FilterConfig,
    ObservatoryIdParam,
    OrganizationIdParam,
    PaginatedResponse,
    PaginationParams,
    Resource,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from 'services/backend/types';

export const resourcesUrl = `${url}resources/`;
export const resourcesApi = backendApi.extend(() => ({ prefixUrl: resourcesUrl }));

export const updateResource = (id: string, label?: string, classes: string[] | null = null, extractionMethod?: string) =>
    resourcesApi
        .put<Resource>(id, {
            json: {
                ...(label ? { label } : null),
                ...(classes ? { classes } : null),
                ...(extractionMethod ? { extraction_method: extractionMethod } : null),
            },
        })
        .json();

/* Can be replaced with updateResource */
export const updateResourceClasses = (id: string, classes: string[] | null = null) =>
    resourcesApi.put<Resource>(id, { json: { ...(classes ? { classes } : null) } }).json();

export const createResource = (label: string, classes: string[] = [], id: string | undefined = undefined) =>
    resourcesApi.post<Resource>('', { json: { label, classes, id } }).json();

export const getResource = (id: string) => resourcesApi.get<Resource>(id).json();

export const getResourcesByIds = (ids: string[]): Promise<Resource[]> => Promise.all(ids.map((id) => getResource(id)));

export const deleteResource = (id: string) => resourcesApi.delete<void>(id).json();

export type GetResourcesParams<T extends boolean = false> = {
    q?: string | null;
    exact?: boolean;
    filters?: FilterConfig[];
    published?: boolean;
    createdAtStart?: string | null;
    createdAtEnd?: string | null;
    include?: string[];
    exclude?: string[];
    baseClass?: string | null;
    returnContent?: T;
} & PaginationParams &
    VisibilityParam &
    VerifiedParam &
    CreatedByParam &
    SdgParam &
    ObservatoryIdParam &
    OrganizationIdParam;

/**
 * Fetches resources based on various filter and sorting criteria.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string|null} [params.q=null] - Query string for searching resources.
 * @param {boolean} [params.exact=false] - Flag for exact match in search.
 * @param {string|null} [params.createdAtStart=null] - Start date for creation date filter. eg: 2023-11-30T08:25:14.049085776+01:00
 * @param {string|null} [params.createdAtEnd=null] - End date for creation date filter. eg: 2023-11-30T10:25:14.049085776+01:00
 * @param {string[]} [params.include=[]] - Filter for a set of classes that the resource must have.
 * @param {string[]} [params.exclude=[]] - Filter for a set of classes that the resource must not have.
 * @param {boolean} [params.returnContent=false] - Flag to return only content field in response.
 * @returns {Promise<PaginatedResponse<Resource> | Resource[]>} A promise to the resource data.
 */
export const getResources = <T extends boolean = false>({
    q = null,
    exact = false,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by = undefined,
    createdAtStart = null,
    createdAtEnd = null,
    include = [],
    exclude = [],
    observatory_id = undefined,
    organization_id = undefined,
    page = 0,
    size = 9999,
    sortBy = [
        {
            property: 'created_at',
            direction: 'desc',
        },
    ],
    baseClass = null,
    returnContent = false as T,
}: GetResourcesParams<T>): Promise<T extends true ? Resource[] : PaginatedResponse<Resource>> => {
    const sort = sortBy?.map((p) => `${p.property},${p.direction}`);
    const searchParams = qs.stringify(
        {
            page,
            size,
            ...(q ? { q, exact } : { sort }),
            visibility,
            created_by,
            created_at_start: createdAtStart,
            created_at_end: createdAtEnd,
            ...(baseClass ? { base_class: baseClass } : {}),
            ...(include?.length ? { include: include.join(',') } : {}),
            ...(exclude?.length ? { exclude: exclude.join(',') } : {}),
            observatory_id,
            organization_id,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );
    return resourcesApi
        .get<PaginatedResponse<Resource>>('', {
            searchParams,
        })
        .json()
        .then((res) => (returnContent ? res.content : res)) as Promise<T extends true ? Resource[] : PaginatedResponse<Resource>>;
};

export const getContributorsByResourceId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return resourcesApi
        .get<PaginatedResponse<string>>(`${encodeURIComponent(id)}/contributors`, {
            searchParams,
        })
        .json()
        .then(async (contributors) => {
            const uniqContributors = uniq(contributors.content);
            const uniqContributorsInfosRequests = uniqContributors.map((contributor) =>
                contributor === MISC.UNKNOWN_ID
                    ? { id: MISC.UNKNOWN_ID, display_name: 'Unknown' }
                    : getContributorInformationById(contributor).catch(() => ({ id: contributor, display_name: 'User not found' })),
            );
            const uniqContributorsInfos = await Promise.all(uniqContributorsInfosRequests);
            return {
                ...contributors,
                content: contributors.content.map((u) => uniqContributorsInfos.find((i) => u === i.id)),
            };
        });
};

export const getTimelineByResourceId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return resourcesApi
        .get<
            PaginatedResponse<{
                created_by: string;
                created_at: string;
            }>
        >(`${encodeURIComponent(id)}/timeline`, {
            searchParams,
        })
        .json()
        .then(async (contributors) => {
            const uniqContributors = uniqBy(contributors.content, 'created_by');
            const uniqContributorsInfosRequests = uniqContributors.map((contributor) =>
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
                content: contributors.content.map((u) => ({ ...u, created_by: uniqContributorsInfos.find((i) => u.created_by === i.id) })),
            };
        });
};

export const addResourceToObservatory = ({ observatory_id, organization_id, id }: { observatory_id: string; organization_id: string; id: string }) =>
    resourcesApi.put<void>(`${id}/observatory`, { json: { observatory_id, organization_id } }).json();

export const markAsFeatured = (id: string) => resourcesApi.put<void>(`${id}/metadata/featured`).json();

export const removeFeaturedFlag = (id: string) => resourcesApi.delete<void>(`${id}/metadata/featured`).json();

export const markAsUnlisted = (id: string) => resourcesApi.put<void>(`${id}/metadata/unlisted`).json();

export const removeUnlistedFlag = (id: string) => resourcesApi.delete<void>(`${id}/metadata/unlisted`).json();
