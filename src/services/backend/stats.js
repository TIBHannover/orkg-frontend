import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import queryString from 'query-string';

export const statsUrl = `${url}stats/`;

export const getStats = () => {
    return submitGetRequest(statsUrl);
};

export const getResearchFieldsStats = () => {
    return submitGetRequest(`${statsUrl}fields`);
};

export const getComparisonsCountByObservatoryId = id => {
    return submitGetRequest(`${statsUrl}${encodeURIComponent(id)}/observatoryComparisonsCount`);
};

export const getTopContributors = ({ researchFieldId = null, page = 0, items = 9999, sortBy = 'created_at', desc = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page: page, size: items, sort });
    return submitGetRequest(`${statsUrl}${researchFieldId ? `research-field/${researchFieldId}/` : ''}top/contributors?${params}`);
};

export const getChangelogs = ({ page = 0, items = 9999, sortBy = 'created_at', desc = true, subfields = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page: page, size: items /*, sort, desc*/ });
    return submitGetRequest(`${statsUrl}top/changelog?${params}`);
};

export const getTopResearchProblems = ({ page = 0, items = 9999, sortBy = 'created_at', desc = true, subfields = true }) => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = queryString.stringify({ page: page, size: items /*, sort, desc*/ });
    return submitGetRequest(`${statsUrl}top/research-problems?${params}`);
};
