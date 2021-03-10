import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const fieldsUrl = `${url}research-fields/`;

export const getResearchProblemsByResearchFieldId = ({ id, page = 0, items = 1 }) => {
    const params = queryString.stringify({ page: page, size: items });
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/problems?${params}`);
};

/*
http://www.localhost:8080/api/research-fields/{id}/subfields/problems
http://www.localhost:8080/api/research-fields/{id}/subfields/contributors
http://www.localhost:8080/api/research-fields/{id}/subfields/comparisons
http://www.localhost:8080/api/research-fields/{id}/subfields/papers
*/

export const getComparisonsByResearchFieldId = ({ id, page = 0, items = 9999, sortBy = 'created_at', desc = true, subfields = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page: page, size: items, sort });
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}comparisons?${params}`);
};

export const getPapersByResearchFieldId = ({ id, page = 0, items = 9999, sortBy = 'created_at', desc = true, subfields = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page: page, size: items, sort });
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}papers?${params}`);
};

export const getContributorsByResearchFieldId = ({ id, page = 0, items = 9999, sortBy = 'created_at', desc = true, subfields = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page: page, size: items /*, sort, desc*/ });
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/${subfields ? 'subfields/' : ''}contributors?${params}`);
};
