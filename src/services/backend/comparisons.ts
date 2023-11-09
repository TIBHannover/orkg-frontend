import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { PaginatedResponse } from 'services/backend/types';

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
    items = 9999,
}: {
    id: string;
    page?: number;
    items?: number;
}): Promise<PaginatedResponse<ComparisonTopAuthor>> => {
    const params = qs.stringify({ page, size: items });
    return submitGetRequest(`${comparisonUrl}${encodeURIComponent(id)}/authors?${params}`);
};
