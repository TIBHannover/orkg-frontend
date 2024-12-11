import { url } from 'constants/misc';
import backendApi from 'services/backend/backendApi';
import { prepareParams } from 'services/backend/misc';
import { BenchmarkSummary, PaginatedResponse, PaginationParams } from 'services/backend/types';

export const benchmarksUrl = `${url}benchmarks/`;
export const benchmarksApi = backendApi.extend(() => ({ prefixUrl: benchmarksUrl }));

// Get a set of benchmarks where each benchmark item is a summary with the following attributes:
// research_field, research_problem, total_papers, total_datasets, total_codes
export const getAllBenchmarks = ({ page = 0, size = 9999, sortBy = [{ property: 'totalPapers', direction: 'desc' }] }: PaginationParams) => {
    const searchParams = prepareParams({ page, size, sortBy });
    return benchmarksApi
        .get<PaginatedResponse<BenchmarkSummary>>(`summary`, {
            searchParams,
        })
        .json();
};
