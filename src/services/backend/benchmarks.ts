import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { BenchmarkSummary, PaginatedResponse } from 'services/backend/types';

export const benchmarksUrl = `${url}benchmarks/`;

// Get a set of benchmarks where each benchmark item is a summary with the following attributes:
// research_field, research_problem, total_papers, total_datasets, total_codes
export const getAllBenchmarks = ({
    page = 0,
    size = 9999,
    sortBy = 'totalPapers',
    desc = true,
}: {
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
}): Promise<PaginatedResponse<BenchmarkSummary>> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${benchmarksUrl}summary/?${params}`);
};
