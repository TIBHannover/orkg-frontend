import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const fieldsUrl = `${url}research-fields/`;

export const getResearchProblemsByResearchFieldId = ({ id, page = 1, items = 1 }) => {
    const params = queryString.stringify({ page: page, items: items });
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/problems?${params}`);
};

//the following service was discussed in the following issue
//https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263

//# Obtain the list of research fields with benchmarks:
//$ curl --silent http://localhost:8080/api/research-fields/benchmarks | jq .

export const getResearchFieldsWithBenchmarks = submitGetRequest(`${fieldsUrl}/benchmarks$`);
