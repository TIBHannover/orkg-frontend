import { ENTITIES } from 'constants/graphSettings';
import { url } from 'constants/misc';
import { submitPostRequest } from 'network';
import qs from 'qs';
import { getClassById, getClasses } from 'services/backend/classes';
import { getPredicate, getPredicates } from 'services/backend/predicates';
import { getResource, getResources } from 'services/backend/resources';
import {
    Class,
    CreatedByParam,
    PaginatedResponse,
    PaginationParams,
    Predicate,
    PublishedParam,
    Resource,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from 'services/backend/types';
import { mergeAlternate } from 'utils';

export const doisUrl = `${url}dois/`;

export const generateDoi = ({
    type,
    resource_type,
    resource_id,
    title,
    subject,
    description,
    related_resources = [],
    authors = [],
    url,
}: {
    type: string;
    resource_type: string;
    resource_id: string;
    title: string;
    subject: string;
    description: string;
    related_resources?: string[];
    authors?: string[];
    url: string;
}): Promise<{ doi: string }> =>
    submitPostRequest(
        doisUrl,
        { 'Content-Type': 'application/json' },
        { type, resource_type, resource_id, title, subject, description, related_resources, authors, url },
    );

export const createObject = (payload: object): Promise<Resource> =>
    submitPostRequest(`${url}objects/`, { 'Content-Type': 'application/json' }, payload);

export const getEntities = (
    entityType: string,
    params: {
        page?: number;
        size?: number;
        q?: string | null;
        exclude?: string[];
        exact?: boolean;
    },
): Promise<PaginatedResponse<Resource | Predicate | Class> | Resource[] | Predicate[] | Class[] | Class> => {
    // { page = 0, size = 9999, sortBy = 'created_at', desc = true, q = null, exact = false, returnContent = false }
    // for resources there additional parameter: exclude
    // for resources there additional parameter: uri
    switch (entityType) {
        case ENTITIES.RESOURCE:
            return getResources(params);
        case ENTITIES.PREDICATE:
            return getPredicates(params);
        case ENTITIES.CLASS:
            return getClasses(params);
        default:
            return getResources(params);
    }
};

/**
 * Get entity by ID
 *
 * @param {String} entityType - Entity Type
 * @param {String} id - Entity ID
 * @return {Promise} Promise object
 */
export const getEntity = (entityType: string = ENTITIES.RESOURCE, id: string): Promise<Resource | Predicate | Class> => {
    switch (entityType) {
        case ENTITIES.RESOURCE:
            return getResource(id);
        case ENTITIES.PREDICATE:
            return getPredicate(id);
        case ENTITIES.CLASS:
            return getClassById(id);
        default:
            return getResource(id);
    }
};

/**
 * Merge two paginated results (Alternate content)
 *
 * @param {PaginatedResponse<Resource>} response1 - Paginated Response 1
 * @param {PaginatedResponse<Resource>} response2 - Paginated Response 2
 * @return {PaginatedResponse<Resource>} - Merged responses
 */
export const mergePaginateResponses = (
    response1: PaginatedResponse<Resource>,
    response2: PaginatedResponse<Resource>,
): PaginatedResponse<Resource> => ({
    ...response1,
    content: mergeAlternate(response1.content, response2.content),
    totalElements: response1.totalElements + response2.totalElements,
    totalPages: response1.totalPages + response2.totalPages,
    last: response1.last && response2.last,
});

export const prepareParams = (params: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & PublishedParam): string =>
    qs.stringify(
        {
            page: params.page,
            size: params.size,
            sort: params.sortBy?.map((p) => `${p.property},${p.direction}`),
            verified: params.verified,
            visibility: params.visibility,
            created_by: params.created_by,
            sdg: params.sdg,
            published: params.published,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );
