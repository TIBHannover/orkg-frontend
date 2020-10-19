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

export const getAllPredicates = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc, ...(q ? { q: q } : {}) });

    return submitGetRequest(`${predicatesUrl}?${params}`);
};

export const getPredicatesByLabel = label => {
    return submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label));
};
