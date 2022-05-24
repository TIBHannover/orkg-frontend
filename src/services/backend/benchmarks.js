import { url } from 'constants/misc';
import { submitGetRequest } from 'network';

export const benchmarksUrl = `${url}benchmarks/`;

// the services defined here were discussed in the following issue
// https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263

// Get a set of benchmarks where each benchmark item is a summary with the following attributes:
// research_problem, total_papers, total_datasets, total_codes
export const getBenchmarksByResearchFieldId = rfId => submitGetRequest(`${benchmarksUrl}summary/research-field/${encodeURIComponent(rfId)}`);
