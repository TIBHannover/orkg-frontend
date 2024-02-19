import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';
import qs from 'qs';
import { Author, PaginatedResponse } from 'services/backend/types';

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

// type not complete, but part of other issue: https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/issues/1610
export type Comparison = {
    id: string;
    title: string;
    description: string;
    research_fields: string[];
    identifiers: {
        doi?: string;
    };
    publication_info: {
        published_month: number;
        published_year: number;
        published_in: string | null;
        url: string | null;
    };
    authors: Author[];
    contributions: any[];
    visualizations: any[];
    related_figures: any[];
    related_resources: any[];
    references: any[];
    observatories: string[];
    organizations: string[];
    extraction_method: string;
    created_at: string;
    created_by: string;
    previous_version: string;
    is_anonymized: boolean;
    visibility: string;
};

export const getComparison = (id: string): Promise<Comparison> => submitGetRequest(`${comparisonUrl}${encodeURIComponent(id)}`);
