'use client';

import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPatchRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { Class, PaginatedResponse, PaginationParams } from 'services/backend/types';

export const classesUrl = `${url}classes/`;

export const getClassById = (id: string): Promise<Class> => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/`);

export const createClass = (label: string, uri: string | null = null, id: string | null = null): Promise<Class> =>
    submitPostRequest(classesUrl, { 'Content-Type': 'application/json' }, { label, uri, id });

export const updateClass = (id: string, label: string): Promise<Class> =>
    submitPutRequest(`${classesUrl}${id}`, { 'Content-Type': 'application/json' }, { label });

export type GetClassesParams<T extends boolean = false, U extends string | null = null> = {
    q?: string | null;
    exact?: boolean;
    returnContent?: T;
    uri?: U;
} & PaginationParams;

export const getClasses = <T extends boolean = false, U extends string | null = null>({
    page = 0,
    size = 9999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    q = null,
    exact = false,
    uri = null as U,
    returnContent = false as T,
}: GetClassesParams<T, U>): Promise<U extends string ? Class : T extends true ? Class[] : PaginatedResponse<Class>> => {
    const sort = sortBy.map(({ property, direction }) => `${property},${direction}`).join(',');
    const params = qs.stringify(
        { page, size, exact, ...(q ? { q } : { sort }), uri },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return submitGetRequest(`${classesUrl}?${params}`).then((res) => {
        if (uri) {
            return res as Class;
        }
        return (returnContent ? res.content : res) as any;
    });
};

/**
 * Count instances including subclasses
 */
export const getCountInstances = (id: string): Promise<{ count: number }> => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/count`);

/**
 * Lists all direct child classes.
 */
export const getChildrenByID = ({
    id,
    page = 0,
    size = 9999,
}: {
    id: string;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<{ child_count: number; class: Class }[]>> => {
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
export const createChildrenForID = (id: string, childIds: string[]): Promise<Class> =>
    submitPostRequest(`${classesUrl}${encodeURIComponent(id)}/children`, { 'Content-Type': 'application/json' }, { child_ids: childIds });

/**
 * Update a class-subclass relation
 */
export const updateChildrenForID = (id: string, childIds: string[]): Promise<Class> =>
    submitPatchRequest(`${classesUrl}${encodeURIComponent(id)}/children`, { 'Content-Type': 'application/json' }, { child_ids: childIds });

/**
 * Get parent class
 */
export const getParentByID = (id: string): Promise<Class> => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/parent`);

/**
 * Set parent class
 */
export const setParentClassByID = (id: string, parentId: string): Promise<null> =>
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
export const deleteParentByID = (id: string): Promise<null> =>
    submitDeleteRequest(`${classesUrl}${encodeURIComponent(id)}/parent`, { 'Content-Type': 'application/json' });

/**
 * Get root class
 */
export const getRootByID = (id: string): Promise<Class> => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/root`);

/**
 * Get all root classes
 */
export const getAllRootClasses = (): Promise<PaginatedResponse<Class[]>> => submitGetRequest(`${classesUrl}roots`);

/**
 * Get hierarchy by class ID
 */
export const getHierarchyByID = ({
    id,
    page = 0,
    size = 9999,
}: {
    id: string;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<{ parent_id: number | null; class: Class }>> => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/hierarchy?${params}`);
};
