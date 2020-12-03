import { submitPostRequest, submitPutRequest, submitGetRequest } from 'network';
import queryString from 'query-string';
import { url } from 'constants/misc';

export const predicatesUrl = `${url}predicates/`;

export const getPredicate = id => {
    return submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);
};

export const createPredicate = label => {
    return submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const updatePredicate = (id, label) => {
    return submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const getAllPredicates = ({ page = 0, items: size = 9999, sortBy = 'created_at', desc = true, q = null, exact = false }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort, exact, ...(q ? { q } : {}) });

    return submitGetRequest(`${predicatesUrl}?${params}`).then(res => res.content);
};

export const getPredicatesByLabel = label => {
    return submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label));
};
