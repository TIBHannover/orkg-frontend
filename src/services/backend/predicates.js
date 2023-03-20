import { submitPostRequest, submitPutRequest, submitGetRequest, submitDeleteRequest } from 'network';
import qs from 'qs';
import { url } from 'constants/misc';

export const predicatesUrl = `${url}predicates/`;

export const getPredicate = id => submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);

export const createPredicate = (label, id = undefined) => submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label, id });

export const updatePredicate = (id, label) => submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' }, { label });

export const deletePredicate = id => submitDeleteRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' });

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
    const params = qs.stringify(
        { page, size, sort, exact, ...(q ? { q } : {}) },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${predicatesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};
