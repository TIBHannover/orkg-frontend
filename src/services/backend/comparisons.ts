import qs from 'qs';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { prepareParams } from '@/services/backend/misc';
import {
    Author,
    Comparison,
    ComparisonRelatedFigure,
    ComparisonRelatedResource,
    CreatedByParam,
    ObservatoryIdParam,
    OrganizationIdParam,
    PaginatedResponse,
    PaginationParams,
    PublishedParam,
    ResearchFieldIdParams,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from '@/services/backend/types';

export const comparisonUrl = `${url}comparisons/`;
export const comparisonsApi = backendApi.extend(() => ({ prefixUrl: comparisonUrl }));
const COMPARISONS_CONTENT_TYPE = 'application/vnd.orkg.comparison.v2+json';

export type ComparisonTopAuthor = {
    author: {
        value: string;
    };
    info: {
        paper_id: string;
        author_index: number;
        paper_year: number;
    }[];
};

export const getAuthorsByComparisonId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify({ page, size });
    return comparisonsApi
        .get<PaginatedResponse<ComparisonTopAuthor>>(`${encodeURIComponent(id)}/authors`, {
            searchParams,
        })
        .json();
};

export const getComparison = (id: string): Promise<Comparison> =>
    comparisonsApi
        .get<Comparison>(encodeURIComponent(id), {
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();

export const getComparisonRelatedFigure = ({ comparisonId, relatedFigureId }: { comparisonId: string; relatedFigureId: string }) =>
    comparisonsApi
        .get<ComparisonRelatedFigure>(`${encodeURIComponent(comparisonId)}/related-figures/${encodeURIComponent(relatedFigureId)}`, {
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();

export type UpdateComparisonRelatedFigureParams = Partial<Omit<ComparisonRelatedFigure, 'id'>>;

export const updateComparisonRelatedFigure = ({
    comparisonId,
    relatedFigureId,
    data,
}: {
    comparisonId: string;
    relatedFigureId: string;
    data: UpdateComparisonRelatedFigureParams;
}) => {
    return comparisonsApi
        .put<void>(`${encodeURIComponent(comparisonId)}/related-figures/${encodeURIComponent(relatedFigureId)}`, {
            json: data,
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
                'Content-Type': COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();
};

export const createComparisonRelatedFigure = ({ comparisonId, data }: { comparisonId: string; data: UpdateComparisonRelatedFigureParams }) => {
    return comparisonsApi
        .post<void>(`${encodeURIComponent(comparisonId)}/related-figures`, {
            json: data,
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
                'Content-Type': COMPARISONS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const deleteComparisonRelatedFigure = ({ comparisonId, relatedFigureId }: { comparisonId: string; relatedFigureId: string }) => {
    return comparisonsApi
        .delete<void>(`${encodeURIComponent(comparisonId)}/related-figures/${relatedFigureId}`, {
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
                'Content-Type': COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();
};

export const getComparisonRelatedResource = ({ comparisonId, relatedResourceId }: { comparisonId: string; relatedResourceId: string }) =>
    comparisonsApi
        .get<ComparisonRelatedResource>(`${encodeURIComponent(comparisonId)}/related-resources/${encodeURIComponent(relatedResourceId)}`, {
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();

export type UpdateComparisonRelatedResourceParams = Partial<Omit<ComparisonRelatedResource, 'id'>>;

export const updateComparisonRelatedResource = ({
    comparisonId,
    relatedResourceId,
    data,
}: {
    comparisonId: string;
    relatedResourceId: string;
    data: UpdateComparisonRelatedResourceParams;
}) => {
    return comparisonsApi
        .put<void>(`${encodeURIComponent(comparisonId)}/related-resources/${encodeURIComponent(relatedResourceId)}`, {
            json: data,
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
                'Content-Type': COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();
};

export const createComparisonRelatedResource = ({
    comparisonId,
    data,
}: {
    comparisonId: string;
    data: UpdateComparisonRelatedResourceParams;
}): Promise<string> => {
    return comparisonsApi
        .post<void>(`${encodeURIComponent(comparisonId)}/related-resources`, {
            json: data,
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
                'Content-Type': COMPARISONS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const deleteComparisonRelatedResource = ({ comparisonId, relatedResourceId }: { comparisonId: string; relatedResourceId: string }) => {
    return comparisonsApi
        .delete<void>(`${encodeURIComponent(comparisonId)}/related-resources/${relatedResourceId}`, {
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();
};

export type UpdateComparisonParams = Partial<
    Omit<Comparison, 'id' | 'research_fields' | 'sdgs' | 'contributions'> & { research_fields: string[] } & {
        sdgs: string[];
        contributions: string[];
    }
>;

export const updateComparison = (id: string, data: UpdateComparisonParams) => {
    return comparisonsApi
        .put<void>(`${encodeURIComponent(id)}`, {
            json: data,
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
                'Content-Type': COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();
};

export type GetComparisonParams = PaginationParams &
    VerifiedParam &
    VisibilityParam &
    CreatedByParam &
    SdgParam &
    ObservatoryIdParam &
    OrganizationIdParam &
    ResearchFieldIdParams &
    PublishedParam;

export const getComparisons = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    observatory_id,
    organization_id,
    research_field,
    include_subfields,
    sdg,
    published,
}: GetComparisonParams): Promise<PaginatedResponse<Comparison>> => {
    const searchParams = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        organization_id,
        sdg,
        research_field,
        include_subfields,
        published,
    });
    return comparisonsApi
        .get<PaginatedResponse<Comparison>>('', {
            searchParams,
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
            },
        })
        .json();
};

export const createComparison = (
    data: Partial<
        Omit<Comparison, 'contributions'> & {
            contributions: string[];
        }
    >,
) =>
    comparisonsApi
        .post<string>('', {
            json: data,
            headers: {
                Accept: COMPARISONS_CONTENT_TYPE,
                'Content-Type': COMPARISONS_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

type PublishComparisonParams = {
    subject: string;
    description: string;
    authors: Author[];
    assign_doi: boolean;
};

export const publishComparison = (comparisonId: string, data: PublishComparisonParams) =>
    comparisonsApi
        .post<string>(`${encodeURIComponent(comparisonId)}/publish`, {
            json: data,
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));
