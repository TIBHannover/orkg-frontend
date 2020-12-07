import { url } from 'constants/misc';
import { submitPostRequest, submitGetRequest } from 'network';
import queryString from 'query-string';

export const classesUrl = `${url}classes/`;

export const getClassById = id => {
    return submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/`);
};

export const createClass = (label, uri = null) => {
    return submitPostRequest(classesUrl, { 'Content-Type': 'application/json' }, { label: label, uri: uri });
};

export const getClasses = ({
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    exact = false,
    uri = null,
    returnContent = false
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify(
        { page, size, sort, exact, ...(q ? { q: q } : {}), uri },
        {
            skipNull: true,
            skipEmptyString: true
        }
    );

    return submitGetRequest(`${classesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};
