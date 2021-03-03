import { url } from 'constants/misc';
import { submitGetRequest } from 'network';

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

export const getTopContributors = id => {
    return submitGetRequest(`${statsUrl}/top/contributors`);
};

export const getChangelogs = id => {
    return submitGetRequest(`${statsUrl}/top/changelog`);
};

export const getTopResearchProblems = id => {
    return submitGetRequest(`${statsUrl}/top/research-problems`);
};
