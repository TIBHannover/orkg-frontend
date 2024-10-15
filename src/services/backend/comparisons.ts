import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { getCreatedIdFromHeaders, submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';
import { prepareParams } from 'services/backend/misc';
import {
    Author,
    Comparison,
    CreatedByParam,
    ObservatoryIdParam,
    PaginatedResponse,
    PaginationParams,
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
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & ObservatoryIdParam & ResearchFieldIdParams): Promise<
    PaginatedResponse<Comparison>
> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility, created_by, observatory_id, sdg, research_field, include_subfields });
    return submitGetRequest(`${comparisonUrl}?${params}`);
};

export const createComparison = (data: Partial<Comparison>): Promise<string> =>
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
    config: {
        predicates: string[];
        contributions: string[];
        transpose: boolean;
        type: string;
    };
    data: {
        contributions: {
            id: string;
            label: string;
            paper_id: string;
            paper_label: string;
            paper_year: number;
            active: boolean;
        }[];
        predicates: {
            id: string;
            label: string;
            n_contributions: number;
            active: boolean;
            similar_predicates: string[];
        }[];
        data: {
            id: string;
            label: string;
            classes: string[];
            path: string[];
            path_labels: string[];
            _class: string;
        }[][];
    };
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
    );
