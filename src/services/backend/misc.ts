import qs from 'qs';

import { ENTITIES } from '@/constants/graphSettings';
import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { getClasses } from '@/services/backend/classes';
import { getPredicates } from '@/services/backend/predicates';
import { getResources } from '@/services/backend/resources';
import {
    AuthorIdParam,
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
    VerifiedParam,
    VisibilityParam,
} from '@/services/backend/types';
import { mergeAlternate } from '@/utils';

export const doisUrl = `${url}dois/`;
export const doisApi = backendApi.extend(() => ({ prefixUrl: doisUrl }));
export const objectsUrl = `${url}objects/`;
export const objectsApi = backendApi.extend(() => ({ prefixUrl: objectsUrl }));

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
    doisApi
        .post<{ doi: string }>('', { json: { type, resource_type, resource_id, title, subject, description, related_resources, authors, url } })
        .json();

export const createObject = (payload: object) => objectsApi.post<Resource>('', { json: payload }).json();

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
        AuthorIdParam,
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
