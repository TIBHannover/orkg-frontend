import { url } from 'constants/misc';
import { submitGetRequest } from 'network';

export const datasetsUrl = `${url}datasets/`;

// The services defined here were discussed in the following issue
// https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263

/**
 * Get a dataset benchmark summary for a research problem
 * Each benchmark on the dataset is define by the following attributes:
 * model_name, score, metric, paper_title, code_urls
 * */
export const getDatasetBenchmarksByDatasetId = (datasetId, problemId) => {
    return submitGetRequest(`${datasetsUrl}${datasetId}/problem/${problemId}/summary`);
};

/**
 * Get the list of research problems of a dataset
 * */
export const getResearchProblemsByDatasetId = datasetId => {
    return submitGetRequest(`${datasetsUrl}${datasetId}/problems`);
};

/**
 * Get the datasets for a research problem: (a.k.a. Benchmark Summary)
 * */
export const getDatasetsBenchmarksByResearchProblemId = resourceId => {
    return submitGetRequest(`${datasetsUrl}research-problem/${encodeURIComponent(resourceId)}`);
};
