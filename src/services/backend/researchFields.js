import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const fieldsUrl = `${url}research-fields/`;

export const getResearchProblemsByResearchFieldId = ({ id, page = 0, items = 1 }) => {
    const params = queryString.stringify({ page: page, size: items });
    return submitGetRequest(`${fieldsUrl}${encodeURIComponent(id)}/problems?${params}`);
};
