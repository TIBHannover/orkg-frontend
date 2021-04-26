import { url } from 'constants/misc';
import { submitGetRequest } from 'network';

export const datasetsUrl = `${url}datasets/`;

// The services defined here were discussed in the following issue
// https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263

/**
 * Get a dataset benchmark summary.
 * Each benchmark on the dataset is define by the following attributes:
 * model_name, score, metric, paper_title, code_urls
 * */
export const getDatasetBenchmarksByDatasetId = resourceId => {
    return submitGetRequest(`${datasetsUrl}${encodeURIComponent(resourceId)}/summary`);
};
