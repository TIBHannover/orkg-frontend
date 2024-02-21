import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import { prepareParams } from 'services/backend/misc';
import { BenchmarkSummary, PaginatedResponse, PaginationParams } from 'services/backend/types';

export const benchmarksUrl = `${url}benchmarks/`;

// Get a set of benchmarks where each benchmark item is a summary with the following attributes:
// research_field, research_problem, total_papers, total_datasets, total_codes
export const getAllBenchmarks = ({
    page = 0,
    size = 9999,
    sortBy = [{ property: 'totalPapers', direction: 'desc' }],
}: PaginationParams): Promise<PaginatedResponse<BenchmarkSummary>> => {
    const params = prepareParams({ page, size, sortBy });
    return submitGetRequest(`${benchmarksUrl}summary/?${params}`);
};
