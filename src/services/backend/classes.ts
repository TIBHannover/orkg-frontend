'use client';

import {
    ClassesApi,
    ClassesApiFindAllRequest,
    ClassHierarchiesApi,
    ClassHierarchiesApiFindAllChildrenByAncestorIdRequest,
    ClassHierarchiesApiFindClassHierarchyRequest,
} from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { WithPaginationParams } from '@/services/backend/types';

export const classesUrl = `${urlNoTrailingSlash}/classes`;

const classesApi = new ClassesApi(configuration);
const classHierarchiesApi = new ClassHierarchiesApi(configuration);

export const getClassById = (id: string) => classesApi.findById({ id });

export const createClass = (label: string, uri: string | null = null, id: string | null = null) =>
    classesApi.createRaw({ createClassRequest: { label, uri, id } }).then(getCreatedId);

export const updateClass = (id: string, label: string) => classesApi.update({ id, updateClassRequest: { label } });

export const getClasses = (params: WithPaginationParams<ClassesApiFindAllRequest>) => classesApi.findAll(transformPaginationParams(params));

/**
 * Count instances including subclasses
 */
export const getCountInstances = (id: string) => classHierarchiesApi.countClassInstances({ id });

/**
 * Lists all direct child classes.
 */
export const getChildrenByID = (params: ClassHierarchiesApiFindAllChildrenByAncestorIdRequest) =>
    classHierarchiesApi.findAllChildrenByAncestorId(params);

/**
 * Get parent class
 */
export const getParentByID = (id: string) => classHierarchiesApi.findParentByChildId({ id });

/**
 * Set parent class
 */
export const setParentClassByID = (id: string, parentId: string) =>
    classHierarchiesApi.createParentRelation({ id, createParentRelationRequest: { parentId } });

/**
 * Delete parent class
 */
export const deleteParentByID = (id: string) => classHierarchiesApi.deleteByChildId({ id });

/**
 * Get hierarchy by class ID
 */
export const getHierarchyByID = (params: ClassHierarchiesApiFindClassHierarchyRequest) => classHierarchiesApi.findClassHierarchy(params);
