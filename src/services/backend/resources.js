import { submitPostRequest, submitPutRequest, submitGetRequest } from 'network';
import { getUserInformationById } from 'services/backend/users';
import { MISC } from 'constants/graphSettings';
import queryString from 'query-string';
import { orderBy } from 'lodash';
import { url } from 'constants/misc';

export const resourcesUrl = `${url}resources/`;

export const updateResource = (id, label) => {
    return submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const updateResourceClasses = (id, classes = null) => {
    return submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { ...(classes ? { classes: classes } : null) });
};

export const createResource = (label, classes = []) => {
    return submitPostRequest(resourcesUrl, { 'Content-Type': 'application/json' }, { label, classes });
};

export const getResource = id => {
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/`);
};

export const getAllResources = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null, exclude = null, exact = false }) => {
    const params = queryString.stringify({
        page,
        items,
        sortBy,
        desc,
        exact,
        ...(q ? { q } : {}),
        ...(exclude ? { exclude } : {})
    });

    return submitGetRequest(`${resourcesUrl}?${params}`);
};

export const getContributorsByResourceId = id => {
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/contributors`).then(contributors => {
        const c = contributors.map(contributor => {
            if (contributor.createdBy === MISC.UNKNOWN_ID) {
                return { ...contributor, created_by: { id: MISC.UNKNOWN_ID, display_name: 'Unknown' } };
            } else {
                return getUserInformationById(contributor.createdBy)
                    .then(user => ({ ...contributor, created_by: user }))
                    .catch(() => ({ ...contributor, created_by: { id: MISC.UNKNOWN_ID, display_name: 'Unknown' } }));
            }
        });
        // Order the contribution timeline because it's not ordered in the result
        return Promise.all(c).then(rc => orderBy(rc, ['created_at'], ['desc']));
    });
};

export const addResourceToObservatory = (observatory_id, organization_id, id) => {
    return submitPutRequest(`${resourcesUrl}${id}/observatory`, { 'Content-Type': 'application/json' }, { observatory_id, organization_id });
};
