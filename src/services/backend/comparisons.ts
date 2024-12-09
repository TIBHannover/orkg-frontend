import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { getCreatedIdFromHeaders, submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { prepareParams } from 'services/backend/misc';
import {
    Author,
    Comparison,
    ComparisonRelatedFigure,
    ComparisonRelatedResource,
    CreatedByParam,
    ObservatoryIdParam,
    PaginatedResponse,
    PaginationParams,
    PublishedParam,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
    ResearchFieldIdParams,
} from 'services/backend/types';

export const comparisonUrl = `${url}comparisons/`;

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

export const getAuthorsByComparisonId = ({
    id,
    page = 0,
    size = 9999,
}: {
    id: string;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<ComparisonTopAuthor>> => {
    const params = qs.stringify({ page, size });
    return submitGetRequest(`${comparisonUrl}${encodeURIComponent(id)}/authors?${params}`);
};

export const getComparison = (id: string): Promise<Comparison> => submitGetRequest(`${comparisonUrl}${encodeURIComponent(id)}`);

export const getComparisonRelatedFigure = ({
    comparisonId,
    relatedFigureId,
}: {
    comparisonId: string;
    relatedFigureId: string;
}): Promise<ComparisonRelatedFigure> =>
    submitGetRequest(`${comparisonUrl}${encodeURIComponent(comparisonId)}/related-figures/${encodeURIComponent(relatedFigureId)}`);

export type UpdateComparisonRelatedFigureParams = Partial<Omit<ComparisonRelatedFigure, 'id'>>;

export const updateComparisonRelatedFigure = ({
    comparisonId,
    relatedFigureId,
    data,
}: {
    comparisonId: string;
    relatedFigureId: string;
    data: UpdateComparisonRelatedFigureParams;
}): Promise<null> => {
    return submitPutRequest(
        `${comparisonUrl}${encodeURIComponent(comparisonId)}/related-figures/${encodeURIComponent(relatedFigureId)}`,
        {
            'Content-Type': 'application/vnd.orkg.comparison.v2+json',
            Accept: 'application/vnd.orkg.comparison.v2+json',
        },
        data,
    );
};

export const createComparisonRelatedFigure = ({
    comparisonId,
    data,
}: {
    comparisonId: string;
    data: UpdateComparisonRelatedFigureParams;
}): Promise<string> => {
    return submitPostRequest(
        `${comparisonUrl}${encodeURIComponent(comparisonId)}/related-figures`,
        {
            'Content-Type': 'application/vnd.orkg.comparison.v2+json',
            Accept: 'application/vnd.orkg.comparison.v2+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const deleteComparisonRelatedFigure = ({
    comparisonId,
    relatedFigureId,
}: {
    comparisonId: string;
    relatedFigureId: string;
}): Promise<null> => {
    return submitDeleteRequest(`${comparisonUrl}${encodeURIComponent(comparisonId)}/related-figures/${relatedFigureId}`, {
        'Content-Type': 'application/vnd.orkg.comparison.v2+json',
        Accept: 'application/vnd.orkg.comparison.v2+json',
    });
};

export const getComparisonRelatedResource = ({
    comparisonId,
    relatedResourceId,
}: {
    comparisonId: string;
    relatedResourceId: string;
}): Promise<ComparisonRelatedResource> =>
    submitGetRequest(`${comparisonUrl}${encodeURIComponent(comparisonId)}/related-resources/${encodeURIComponent(relatedResourceId)}`);

export type UpdateComparisonRelatedResourceParams = Partial<Omit<ComparisonRelatedResource, 'id'>>;

export const updateComparisonRelatedResource = ({
    comparisonId,
    relatedResourceId,
    data,
}: {
    comparisonId: string;
    relatedResourceId: string;
    data: UpdateComparisonRelatedResourceParams;
}): Promise<null> => {
    return submitPutRequest(
        `${comparisonUrl}${encodeURIComponent(comparisonId)}/related-resources/${encodeURIComponent(relatedResourceId)}`,
        {
            'Content-Type': 'application/vnd.orkg.comparison.v2+json',
            Accept: 'application/vnd.orkg.comparison.v2+json',
        },
        data,
    );
};

export const createComparisonRelatedResource = ({
    comparisonId,
    data,
}: {
    comparisonId: string;
    data: UpdateComparisonRelatedResourceParams;
}): Promise<string> => {
    return submitPostRequest(
        `${comparisonUrl}${encodeURIComponent(comparisonId)}/related-resources`,
        {
            'Content-Type': 'application/vnd.orkg.comparison.v2+json',
            Accept: 'application/vnd.orkg.comparison.v2+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers));
};

export const deleteComparisonRelatedResource = ({
    comparisonId,
    relatedResourceId,
}: {
    comparisonId: string;
    relatedResourceId: string;
}): Promise<null> => {
    return submitDeleteRequest(`${comparisonUrl}${encodeURIComponent(comparisonId)}/related-resources/${relatedResourceId}`, {
        'Content-Type': 'application/vnd.orkg.comparison.v2+json',
        Accept: 'application/vnd.orkg.comparison.v2+json',
    });
};

export type UpdateComparisonParams = Partial<
    Omit<Comparison, 'id' | 'research_fields' | 'sdgs' | 'contributions'> & { research_fields: string[] } & {
        sdgs: string[];
        contributions: string[];
    }
>;

export const updateComparison = (id: string, data: UpdateComparisonParams): Promise<null> => {
    return submitPutRequest(
        `${comparisonUrl}${encodeURIComponent(id)}`,
        {
            'Content-Type': 'application/vnd.orkg.comparison.v2+json',
            Accept: 'application/vnd.orkg.comparison.v2+json',
        },
        data,
    );
};

export type GetComparisonParams = PaginationParams &
    VerifiedParam &
    VisibilityParam &
    CreatedByParam &
    SdgParam &
    ObservatoryIdParam &
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
    research_field,
    include_subfields,
    sdg,
    published,
}: GetComparisonParams): Promise<PaginatedResponse<Comparison>> => {
    const params = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        sdg,
        research_field,
        include_subfields,
        published,
    });
    return submitGetRequest(`${comparisonUrl}?${params}`);
};

export const createComparison = (
    data: Partial<
        Omit<Comparison, 'contributions'> & {
            contributions: string[];
        }
    >,
): Promise<string> =>
    submitPostRequest(
        `${comparisonUrl}`,
        {
            'Content-Type': 'application/vnd.orkg.comparison.v2+json;charset=UTF-8',
            Accept: 'application/vnd.orkg.comparison.v2+json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers));

type PublishComparisonParams = {
    subject: string;
    description: string;
    authors: Author[];
    assign_doi: boolean;
};

export const publishComparison = (comparisonId: string, data: PublishComparisonParams): Promise<string> =>
    submitPostRequest(
        `${comparisonUrl}${encodeURIComponent(comparisonId)}/publish`,
        {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        data,
        true,
        true,
        true,
        true,
    ).then(({ headers }) => getCreatedIdFromHeaders(headers));
