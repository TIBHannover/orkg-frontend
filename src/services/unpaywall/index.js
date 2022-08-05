import env from '@beam-australia/react-env';
import { upperFirst } from 'lodash';
import { submitGetRequest } from 'network';

export const unpaywallUrl = env('UNPAYWALL_URL');

const mapLocations = locations =>
    locations?.map(location => ({
        name: location.repository_institution || upperFirst(location.host_type),
        url: location.url,
    })) || [];

export const getLinksByDoi = async doi => {
    try {
        const result = await submitGetRequest(`${unpaywallUrl}${encodeURIComponent(doi)}?email=${env('UNPAYWALL_EMAIL')}`);
        return mapLocations(result?.oa_locations);
    } catch (e) {
        console.log(e);
        return [];
    }
};

export const getLinksByTitle = async title => {
    try {
        const result = await submitGetRequest(`${unpaywallUrl}search?query=${encodeURIComponent(title)}&email=${env('UNPAYWALL_EMAIL')}`);
        return mapLocations(result.results?.[0]?.response?.oa_locations);
    } catch (e) {
        console.log(e);
        return [];
    }
};
