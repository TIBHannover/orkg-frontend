import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { prepareParams } from 'services/backend/misc';
import { PaginatedResponse, PaginationParams } from 'services/backend/types';

export const datasetsUrl = `${url}datasets/`;

// The services defined here were discussed in the following issue
// https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263

/**
 * Get a dataset benchmark summary for a research problem
 * Each benchmark on the dataset is define by the following attributes:
 * model_name, score, metric, paper_title, code_urls
 * */
export const getDatasetBenchmarksByDatasetId = ({
    datasetId,
    problemId,
    page = 0,
    size = 9999,
}: {
    datasetId: string;
    problemId: string;
    page?: number;
    size?: number;
}): Promise<
    PaginatedResponse<{
        model_name: string;
        model_id: string;
        score: string;
        metric: string;
        paper_id: string;
        paper_title: string;
        paper_month: number;
        paper_year: number;
        code_urls: string[];
    }>
> => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${datasetsUrl}${datasetId}/problem/${problemId}/summary?${params}`);
};

/**
 * Get the list of research problems of a dataset
 * */

export const getResearchProblemsByDatasetId = ({
    datasetId,
    page = 0,
    size = 9999,
}: {
    datasetId: string;
    page?: number;
    size?: number;
}): Promise<
    PaginatedResponse<{
        id: string;
        label: string;
    }>
> => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${datasetsUrl}${datasetId}/problems?${params}`);
};

/**
 * Get the datasets for a research problem: (a.k.a. Benchmark Summary)
 * */

export const getDatasetsBenchmarksByResearchProblemId = ({
    id,
    page = 0,
    size = 9999,
    sortBy = [
        { property: 'totalPapers', direction: 'desc' },
        { property: 'totalModels', direction: 'desc' },
        { property: 'totalCodes', direction: 'desc' },
        { property: 'dataset.label', direction: 'asc' },
    ],
}: PaginationParams & {
    id: string;
}): Promise<
    PaginatedResponse<{
        id: string;
        label: string;
        total_models: number;
        total_papers: number;
        total_codes: number;
    }>
> => {
    const params = prepareParams({ page, size, sortBy });
    return submitGetRequest(`${datasetsUrl}research-problem/${encodeURIComponent(id)}?${params}`);
};
