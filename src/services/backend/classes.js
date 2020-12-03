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

export const getRDFDataCubeVocabularyClasses = () => {
    return submitGetRequest(`${classesUrl}?q=qb:`).then(res => res.content);
};

export const getAllClasses = ({ page = 0, items: size = 9999, sortBy = 'created_at', desc = true, q = null }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page, size, sort, ...(q ? { q: q } : {}) });

    return submitGetRequest(`${classesUrl}?${params}`);
};

export const getClassOfTemplate = templateId => {
    return submitGetRequest(`${classesUrl}?q=${templateId}&exact=true`);
};
