import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { uniq, uniqBy } from 'lodash';
import { submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { classesUrl } from 'services/backend/classes';
import { getContributorInformationById } from 'services/backend/contributors';

export const resourcesUrl = `${url}resources/`;

export const updateResource = (id, label, classes = null) =>
    submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { label, ...(classes ? { classes } : null) });

export const updateResourceClasses = (id, classes = null) =>
    submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { ...(classes ? { classes } : null) });

export const createResource = (label, classes = [], id = undefined) =>
    submitPostRequest(resourcesUrl, { 'Content-Type': 'application/json' }, { label, classes, id });

export const getResource = id => submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/`);

export const deleteResource = id => submitDeleteRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' });

export const getResources = ({
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    exclude = null,
    exact = false,
    returnContent = false,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        {
            page,
            size,
            exact,
            ...(q ? { q } : { sort, desc }),
            ...(exclude ? { exclude } : {}),
        },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${resourcesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};

export const getContributorsByResourceId = ({ id, page = 0, size = 9999 }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/contributors?${params}`).then(async contributors => {
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
    });
};

export const getTimelineByResourceId = ({ id, page = 0, size = 9999 }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/timeline?${params}`).then(async contributors => {
        const uniqContributors = uniqBy(contributors.content, 'created_by');
        const uniqContributorsInfosRequests = uniqContributors.map(contributor =>
            contributor.created_by === MISC.UNKNOWN_ID
                ? { id: MISC.UNKNOWN_ID, display_name: 'Unknown' }
                : getContributorInformationById(contributor.created_by).catch(() => ({ id: contributor.created_by, display_name: 'User not found' })),
        );
        const uniqContributorsInfos = await Promise.all(uniqContributorsInfosRequests);
        return {
            ...contributors,
            content: contributors.content.map(u => ({ ...u, created_by: uniqContributorsInfos.find(i => u.created_by === i.id) })),
        };
    });
};

export const addResourceToObservatory = ({ observatory_id, organization_id, id }) =>
    submitPutRequest(`${resourcesUrl}${id}/observatory`, { 'Content-Type': 'application/json' }, { observatory_id, organization_id });

export const getResourcesByClass = async ({
    id,
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    creator = null,
    exact = false,
    verified = null,
    returnContent = false,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, creator, exact, ...(q ? { q } : { sort, desc }), verified, visibility },
        {
            skipNulls: true,
        },
    );

    const resources = await submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/resources/?${params}`).then(res =>
        returnContent ? res.content : res,
    );
    return resources;
};

export const markAsFeatured = id => submitPutRequest(`${resourcesUrl}${id}/metadata/featured`, { 'Content-Type': 'application/json' });

export const removeFeaturedFlag = id => submitDeleteRequest(`${resourcesUrl}${id}/metadata/featured`, { 'Content-Type': 'application/json' });

export const markAsUnlisted = id => submitPutRequest(`${resourcesUrl}${id}/metadata/unlisted`, { 'Content-Type': 'application/json' });

export const removeUnlistedFlag = id => submitDeleteRequest(`${resourcesUrl}${id}/metadata/unlisted`, { 'Content-Type': 'application/json' });
