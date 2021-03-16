import { url } from 'constants/misc';
import { submitGetRequest } from 'network';

export const datasetsUrl = `${url}datasets/`;

//the services defined here were discussed in the following issue
//https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263

//curl --silent http://localhost:8080/api/datasets/DS1/summary

//Get a dataset benchmark summary.
//Each benchmark on the dataset is define by the following attributes:
//model_name, score, metric, paper_title, code_url
export const getDatasetBenchmarksByDatasetResourceId = resourceId => {
    return submitGetRequest(`${datasetsUrl}${encodeURIComponent(resourceId)}/summary`);
};

{
    /*
    compared with the papers query
    look at useResearchProblemPapers.js
    getStatementsByObject({id: researchProblemId, page: page, items: pageSize, sortBy: 'created_at'
    it takes several parameters like page, pageSize, etc.
    for datasets, we don't have any such thing, do we need it?
[
  {
    "id": "DS1",
    "label": "SQUAD",
    "total_models": 5,
    "total_papers": 7,
    "total_codes": 2
  },
  {
    "id": "DS2",
    "label": "YahooCQA",
    "total_models": 5,
    "total_papers": 7,
    "total_codes": 2
  }
]
*/
}
