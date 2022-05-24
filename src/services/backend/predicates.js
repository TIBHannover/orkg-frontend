import { submitPostRequest, submitPutRequest, submitGetRequest } from 'network';
import queryString from 'query-string';
import { url } from 'constants/misc';

export const predicatesUrl = `${url}predicates/`;

export const getPredicate = id => submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);

export const createPredicate = label => submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label });

export const updatePredicate = (id, label) => submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' }, { label });

export const getPredicates = ({
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    exact = false,
    returnContent = false,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page, size, sort, exact, ...(q ? { q } : {}) },
        {
            skipNull: true,
            skipEmptyString: true,
        },
    );

    return submitGetRequest(`${predicatesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};
