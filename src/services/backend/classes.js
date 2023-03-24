import { url } from 'constants/misc';
import { submitPostRequest, submitGetRequest } from 'network';
import qs from 'qs';

export const classesUrl = `${url}classes/`;

export const getClassById = id => submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/`);

export const createClass = (label, uri = null) => submitPostRequest(classesUrl, { 'Content-Type': 'application/json' }, { label, uri });

export const getClasses = ({
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    exact = false,
    uri = null,
    returnContent = false,
}) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort, exact, ...(q ? { q } : {}), uri },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${classesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};
