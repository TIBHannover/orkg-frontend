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
    return submitGetRequest(`${classesUrl}?q=qb:`);
};

export const getAllClasses = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc, ...(q ? { q: q } : {}) });

    return submitGetRequest(`${classesUrl}?${params}`);
};

export const getClassOfTemplate = templateId => {
    return submitGetRequest(`${classesUrl}?q=${templateId}&exact=true`);
};
