import { BenchmarksApi } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration } from '@/services/backend/backendApi';
import { PaginationParams } from '@/services/backend/types';

// remove the trailing slash, can be removed when the .env file is updated to remove the trailing slash
export const benchmarksUrl = `${urlNoTrailingSlash}/benchmarks`;

const benchmarksApi = new BenchmarksApi(configuration);

// Get a set of benchmarks where each benchmark item is a summary with the following attributes:
// research_field, research_problem, total_papers, total_datasets, total_codes
export const getAllBenchmarks = ({ page = 0, size = 9999, sortBy = [{ property: 'totalPapers', direction: 'desc' }] }: PaginationParams) => {
    return benchmarksApi.findAllBenchmarkSummaries({
        page,
        size,
        sort: sortBy.map(({ property, direction }) => `${property},${direction}`),
    });
};
