import { url } from 'constants/misc';
import { submitGetRequest } from 'network';

export const statsUrl = `${url}stats/`;

export const getStats = () => {
    return submitGetRequest(statsUrl);
};

export const getResearchFieldsStats = () => {
    return submitGetRequest(`${statsUrl}fields`);
};
