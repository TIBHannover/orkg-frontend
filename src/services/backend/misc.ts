import qs from 'qs';

import { ENTITIES } from '@/constants/graphSettings';
import { getClasses } from '@/services/backend/classes';
import { getPredicates } from '@/services/backend/predicates';
import { getResources } from '@/services/backend/resources';
import {
    AuthorIdParam,
    AuthorNameParam,
    Class,
    CreatedByParam,
    Item,
    ObservatoryIdParam,
    OrganizationIdParam,
    PaginatedResponse,
    PaginationParams,
    Predicate,
    PublishedParam,
    ResearchFieldIdParams,
    Resource,
    SdgParam,
    VenueIdParam,
    VerifiedParam,
    VisibilityParam,
} from '@/services/backend/types';
import { mergeAlternate } from '@/utils';

export const getEntities = (
    entityType: string,
    params: {
        page?: number;
        size?: number;
        q?: string | null;
        exclude?: string[];
        exact?: boolean;
    },
): Promise<PaginatedResponse<Resource | Predicate | Class>> => {
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
 * Merge two paginated results (Alternate content)
 *
 * @param {PaginatedResponse<Resource>} response1 - Paginated Response 1
 * @param {PaginatedResponse<Resource>} response2 - Paginated Response 2
 * @return {PaginatedResponse<Resource>} - Merged responses
 */
export const mergePaginateResponses = (
    response1: PaginatedResponse<Resource | Item>,
    response2: PaginatedResponse<Resource | Item>,
): PaginatedResponse<Resource | Item> => ({
    ...response1,
    content: mergeAlternate(response1.content, response2.content),
    page: {
        number: response1.page.number,
        size: response1.page.size,
        total_elements: response1.page.total_elements + response2.page.total_elements,
        total_pages: Math.max(response1.page.total_pages, response2.page.total_pages),
    },
});

export const prepareParams = (
    params: PaginationParams &
        VerifiedParam &
        VisibilityParam &
        CreatedByParam &
        SdgParam &
        PublishedParam &
        ObservatoryIdParam &
        OrganizationIdParam &
        ResearchFieldIdParams &
        AuthorIdParam &
        AuthorNameParam &
        VenueIdParam,
): string =>
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
            observatory_id: params.observatory_id,
            organization_id: params.organization_id,
            research_field: params.research_field,
            include_subfields: params.include_subfields,
            author_id: params.author_id,
            author_name: params.author_name,
            venue: params.venue,
        },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

export const prepareParamsNoStringify = (
    params: PaginationParams &
        VerifiedParam &
        VisibilityParam &
        CreatedByParam &
        SdgParam &
        PublishedParam &
        ObservatoryIdParam &
        OrganizationIdParam &
        ResearchFieldIdParams,
) => ({
    page: params.page,
    size: params.size,
    sort: params.sortBy?.map((p) => `${p.property},${p.direction}`),
    verified: params.verified,
    visibility: params.visibility,
    created_by: params.created_by,
    sdg: params.sdg,
    published: params.published,
    observatory_id: params.observatory_id,
    organization_id: params.organization_id,
    research_field: params.research_field,
    include_subfields: params.include_subfields,
});
