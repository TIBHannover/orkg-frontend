import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';
import { prepareParams } from 'services/backend/misc';
import {
    Author,
    Comparison,
    CreatedByParam,
    PaginatedResponse,
    PaginationParams,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
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

export const publishComparisonDoi = ({
    id,
    subject,
    description,
    authors,
}: {
    id: string;
    subject: string;
    description: string;
    authors: Author[];
}): Promise<null> =>
    submitPostRequest(
        `${comparisonUrl}${encodeURIComponent(id)}/publish`,
        { 'Content-Type': 'application/json' },
        {
            subject,
            description,
            authors,
        },
    );

export const getComparison = (id: string): Promise<Comparison> => submitGetRequest(`${comparisonUrl}${encodeURIComponent(id)}`);

export const getComparisons = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    sdg,
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam): Promise<PaginatedResponse<Comparison>> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility, created_by, sdg });
    return submitGetRequest(`${comparisonUrl}?${params}`);
};
