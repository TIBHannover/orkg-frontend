import { url } from 'constants/misc';
import { submitPostRequest, submitGetRequest, submitPatchRequest, submitDeleteRequest } from 'network';
import qs from 'qs';

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
    const params = qs.stringify(
        { page, size, exact, ...(q ? { q } : { sort }), uri },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${classesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};

/**
 * Count instances including subclasses
 */
export const getCountInstances = id => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/count`);

/**
 * Lists all direct child classes.
 */
export const getChildrenByID = ({ id, page = 0, size = 9999 }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/children?${params}`);
};

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
export const setParentClassByID = (id, parentId) =>
    submitPostRequest(
        `${classesUrl}${encodeURIComponent(id)}/parent`,
        { 'Content-Type': 'application/json' },
        { parent_id: parentId },
        true,
        true,
        false,
    );

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

/**
 * Get hierarchy by class ID
 */
export const getHierarchyByID = ({ id, page = 0, size = 9999 }) => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/hierarchy?${params}`);
};
