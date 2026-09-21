import {
    ResourcesApi,
    ResourcesApiFindAllRequest,
    TemplateBasedResourceSnapshotsApi,
    TemplateBasedResourceSnapshotsApiFindAllRequest,
    UpdateResourceRequest,
} from '@orkg/orkg-client';
import { uniqBy } from 'lodash';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { MISC } from '@/constants/graphSettings';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, FORMATTED_LABELS_ACCEPT, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { getContributorById } from '@/services/backend/contributors';
import { FilterConfig, Pagination, Resource, SdgParam, VerifiedParam, VisibilityParam, WithPaginationParams } from '@/services/backend/types';

export const resourcesUrl = `${urlNoTrailingSlash}/resources`;

const resourcesApi = new ResourcesApi(configuration);
const snapshotsApi = new TemplateBasedResourceSnapshotsApi(configuration);

export const updateResource = (id: string, data: UpdateResourceRequest) => resourcesApi.update({ id, updateResourceRequest: data });

export const createResource = ({ label, classes, id }: { label: string; classes: string[]; id?: string }) =>
    resourcesApi.createRaw({ createResourceRequest: { label, classes, id } }).then(getCreatedId);

export const getResource = (id: string) => resourcesApi.findById({ id });

export const getResourcesByIds = (ids: string[]): Promise<Resource[]> => Promise.all(ids.map((id) => getResource(id)));

export const deleteResource = (id: string) => resourcesApi.deleteById({ id });

export type GetResourcesParams<T extends boolean = false> = Omit<WithPaginationParams<ResourcesApiFindAllRequest>, 'visibility' | 'accept'> &
    VisibilityParam &
    VerifiedParam &
    SdgParam & {
        // accepted for signature-compatibility with the other content-type listings, but /resources
        // has no corresponding filters, so they are never sent
        filters?: FilterConfig[];
        published?: boolean;
        returnContent?: T;
        returnFormattedLabels?: boolean;
    };

export const getResources = <T extends boolean = false>({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    filters,
    published,
    verified,
    sdg,
    returnContent = false as T,
    returnFormattedLabels = false,
    ...params
}: GetResourcesParams<T>): Promise<T extends true ? Resource[] : Pagination<Resource>> =>
    resourcesApi
        .findAll(
            transformPaginationParams({
                ...params,
                // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
                // into FEATURED + NON_FEATURED before it can reach here
                visibility: visibility as ResourcesApiFindAllRequest['visibility'],
                accept: returnFormattedLabels ? FORMATTED_LABELS_ACCEPT : undefined,
            }),
        )
        .then((res) => (returnContent ? res.content : res)) as Promise<T extends true ? Resource[] : Pagination<Resource>>;

export const getTimelineByResourceId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) =>
    resourcesApi.findTimelineById({ id, page, size }).then(async (timeline) => {
        const uniqContributors = uniqBy(timeline.content, 'createdBy');
        const uniqContributorsInfosRequests = uniqContributors.map((contributor) =>
            contributor.createdBy === MISC.UNKNOWN_ID
                ? { id: MISC.UNKNOWN_ID, displayName: 'Unknown' }
                : getContributorById(contributor.createdBy).catch(() => ({
                      id: contributor.createdBy,
                      displayName: 'User not found',
                  })),
        );
        const uniqContributorsInfos = await Promise.all(uniqContributorsInfosRequests);
        return {
            ...timeline,
            content: timeline.content.map((u) => ({ ...u, createdBy: uniqContributorsInfos.find((i) => u.createdBy === i.id) })),
        };
    });

export const createSnapshot = ({ id, templateId, registerHandle }: { id: string; templateId: string; registerHandle: boolean }) =>
    snapshotsApi.createRaw({ id, createTemplateBasedResourceSnapshotRequest: { templateId, registerHandle } }).then(getCreatedId);

export const getSnapshots = ({
    sortBy = [{ property: 'createdAt', direction: 'desc' }],
    ...params
}: WithPaginationParams<TemplateBasedResourceSnapshotsApiFindAllRequest>) =>
    snapshotsApi.findAll({
        ...transformPaginationParams(params),
        // unlike the older endpoints, snapshots resolves camelCase sort properties and 400s
        // on snake_case; the transform aliases even a pre-formatted `sort` to snake, so the
        // camelCase sort must be applied after it
        sort: sortBy.map(({ property, direction }) => `${property},${direction}`),
    });

export const getSnapshot = ({ id, snapshotId }: { id: string; snapshotId: string }) =>
    // a snapshot URL doubles as a PID landing page: without exactly `Accept: application/json`
    // the backend 308-redirects to the frontend view, whose HTML would fail JSON parsing
    snapshotsApi.findById({ id, snapshotId, accept: 'application/json' });
