'use client';

import qs from 'qs';

import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { Class, CreatedByParam, PaginatedResponse, PaginationParams } from '@/services/backend/types';

export const classesUrl = `${url}classes/`;
export const classesApi = backendApi.extend(() => ({ prefixUrl: classesUrl }));

export const getClassById = (id: string) => classesApi.get<Class>(encodeURIComponent(id)).json();

export const createClass = (label: string, uri: string | null = null, id: string | null = null) =>
    classesApi
        .post<Class>('', {
            json: {
                label,
                uri,
                id,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const updateClass = (id: string, label: string) =>
    classesApi
        .patch<Class>(encodeURIComponent(id), {
            json: {
                label,
            },
        })
        .json();

export type GetClassesParams<T extends boolean = false, U extends string | null = null> = {
    q?: string | null;
    exact?: boolean;
    returnContent?: T;
    uri?: U;
} & PaginationParams &
    CreatedByParam;

export const getClasses = <T extends boolean = false, U extends string | null = null>({
    page = 0,
    size = 9999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    q = null,
    exact = false,
    uri = null as U,
    returnContent = false as T,
    created_by = undefined,
}: GetClassesParams<T, U>): Promise<U extends string ? Class : T extends true ? Class[] : PaginatedResponse<Class>> => {
    const sort = sortBy.map(({ property, direction }) => `${property},${direction}`).join(',');
    const searchParams = qs.stringify(
        { page, size, exact, created_by, ...(q ? { q } : { sort }), uri },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return classesApi
        .get<PaginatedResponse<Class>>('', {
            searchParams,
        })
        .json()
        .then((res) => (returnContent ? res.content : res)) as any;
};

/**
 * Count instances including subclasses
 */
export const getCountInstances = (id: string) => classesApi.get<{ count: number }>(`${encodeURIComponent(id)}/count`).json();

/**
 * Lists all direct child classes.
 */
export const getChildrenByID = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return classesApi
        .get<PaginatedResponse<{ child_count: number; class: Class }[]>>(`${encodeURIComponent(id)}/children`, {
            searchParams,
        })
        .json();
};

/**
 * Get parent class
 */
export const getParentByID = (id: string) => classesApi.get<Class>(`${encodeURIComponent(id)}/parent`).json();

/**
 * Set parent class
 */
export const setParentClassByID = (id: string, parentId: string) =>
    classesApi.post<void>(`${encodeURIComponent(id)}/parent`, { json: { parent_id: parentId } }).json();

/**
 * Delete parent class
 */
export const deleteParentByID = (id: string) => classesApi.delete<void>(`${encodeURIComponent(id)}/parent`).json();

/**
 * Get root class
 */
export const getRootByID = (id: string): Promise<Class> => classesApi.get<Class>(`${encodeURIComponent(id)}/root`).json();

/**
 * Get all root classes
 */
export const getAllRootClasses = () => classesApi.get<PaginatedResponse<Class[]>>(`roots`).json();

/**
 * Get hierarchy by class ID
 */
export const getHierarchyByID = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return classesApi
        .get<PaginatedResponse<{ parent_id: number | null; class: Class }>>(`${encodeURIComponent(id)}/hierarchy`, {
            searchParams,
        })
        .json();
};
