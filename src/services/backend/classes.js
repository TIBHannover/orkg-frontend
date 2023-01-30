import { url } from 'constants/misc';
import { submitPostRequest, submitGetRequest, submitPatchRequest, submitDeleteRequest } from 'network';
import queryString from 'query-string';

export const classesUrl = `${url}classes/`;

export const getClassById = id => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/`);

export const createClass = (label, uri = null) => submitPostRequest(classesUrl, { 'Content-Type': 'application/json' }, { label, uri });

export const getClasses = ({
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    exact = false,
    uri = null,
    returnContent = false,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page, size, sort, exact, ...(q ? { q } : {}), uri },
        {
            skipNull: true,
            skipEmptyString: true,
        },
    );

    return submitGetRequest(`${classesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};

/**
 * Lists all direct child classes.
 */
export const getChildrenByID = id => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/children`);

/**
 * Create a class-subclass relation
 */
export const createChildrenForID = (id, childIds) =>
    submitPostRequest(`${classesUrl}${encodeURIComponent(id)}/children`, { 'Content-Type': 'application/json' }, { child_ids: childIds });

/**
 * Update a class-subclass relation
 */
export const updateChildrenForID = (id, childIds) =>
    submitPatchRequest(`${classesUrl}${encodeURIComponent(id)}/children`, { 'Content-Type': 'application/json' }, { child_ids: childIds });

/**
 * Get parent class
 */
export const getParentByID = id => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/parent`);

/**
 * Set parent class
 */
export const setParentByID = (id, parentId) =>
    submitPostRequest(`${classesUrl}${encodeURIComponent(id)}/parent`, { 'Content-Type': 'application/json' }, { parent_id: parentId });

/**
 * Delete parent class
 */
export const deleteParentByID = id => submitDeleteRequest(`${classesUrl}${encodeURIComponent(id)}/parent`, { 'Content-Type': 'application/json' });

/**
 * Get root class
 */
export const getRootByID = id => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/root`);

/**
 * Get all root classes
 */
export const getAllRootClasses = () => submitGetRequest(`${classesUrl}roots`);
