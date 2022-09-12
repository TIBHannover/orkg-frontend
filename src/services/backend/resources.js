import { submitPostRequest, submitPutRequest, submitGetRequest, submitDeleteRequest } from 'network';
import { getContributorInformationById } from 'services/backend/contributors';
import { classesUrl } from 'services/backend/classes';
import { MISC } from 'constants/graphSettings';
import queryString from 'query-string';
import { orderBy } from 'lodash';
import { url } from 'constants/misc';

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
    const params = queryString.stringify(
        {
            page,
            size,
            sort,
            desc,
            exact,
            ...(q ? { q } : {}),
            ...(exclude ? { exclude } : {}),
        },
        {
            skipNull: true,
            skipEmptyString: true,
        },
    );

    return submitGetRequest(`${resourcesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};

export const getContributorsByResourceId = id =>
    submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/contributors`).then(contributors => {
        const c = contributors.map(contributor => {
            if (contributor.created_by === MISC.UNKNOWN_ID) {
                return { ...contributor, created_by: { id: MISC.UNKNOWN_ID, display_name: 'Unknown' } };
            }
            return getContributorInformationById(contributor.created_by)
                .then(user => ({ ...contributor, created_by: user }))
                .catch(() => ({ ...contributor, created_by: { id: MISC.UNKNOWN_ID, display_name: 'Unknown' } }));
        });
        // Order the contribution timeline because it's not ordered in the result
        return Promise.all(c).then(rc => orderBy(rc, ['created_at'], ['desc']));
    });

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
    featured = null,
    unlisted = null,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page, size, sort, desc, creator, exact, ...(q ? { q } : {}), verified, featured, unlisted },
        {
            skipNull: true,
            skipEmptyString: true,
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
