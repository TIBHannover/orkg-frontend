import { ENTITIES } from '@/constants/graphSettings';
import { getClasses } from '@/services/backend/classes';
import { getPredicates } from '@/services/backend/predicates';
import { getResources } from '@/services/backend/resources';
import { getThings, Thing } from '@/services/backend/things';
import { Class, EntityType, Item, PaginatedResponse, Pagination, Resource } from '@/services/backend/types';
import { mergeAlternate } from '@/utils';

export const getEntities = (
    entityType: EntityType,
    params: {
        page?: number;
        size?: number;
        q?: string;
        exclude?: string[];
        exact?: boolean;
    },
): Promise<Pagination<Thing> | Pagination<Class>> => {
    // { page = 0, size = 9999, sortBy = 'created_at', desc = true, q = null, exact = false, returnContent = false }
    // for resources there additional parameter: exclude
    // for resources there additional parameter: uri
    switch (entityType) {
        case ENTITIES.THING:
            return getThings(params);
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
 * Normalize a wire-format (snake_case) page onto the camelCase shape the generated client
 * produces — the boundary adapter for the endpoints that intentionally stay on ky
 */
export const toCamelPage = <T>(response: PaginatedResponse<T>): Pagination<T> => ({
    ...response,
    page: {
        number: response.page.number,
        size: response.page.size,
        totalElements: response.page.total_elements,
        totalPages: response.page.total_pages,
    },
});

/**
 * Merge two paginated results (Alternate content)
 *
 * @param {Pagination<Resource>} response1 - Paginated Response 1
 * @param {Pagination<Resource>} response2 - Paginated Response 2
 * @return {Pagination<Resource>} - Merged responses
 */
export const mergePaginateResponses = (
    response1: Pagination<Resource | Item>,
    response2: Pagination<Resource | Item>,
): Pagination<Resource | Item> => ({
    ...response1,
    content: mergeAlternate(response1.content, response2.content),
    page: {
        number: response1.page.number ?? 0,
        size: response1.page.size ?? 0,
        totalElements: (response1.page.totalElements ?? 0) + (response2.page.totalElements ?? 0),
        totalPages: Math.max(response1.page.totalPages ?? 0, response2.page.totalPages ?? 0),
    },
});
