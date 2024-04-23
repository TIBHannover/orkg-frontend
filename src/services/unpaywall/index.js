import env from 'components/NextJsMigration/env';
import { upperFirst } from 'lodash';
import { submitGetRequest } from 'network';

export const unpaywallUrl = env('NEXT_PUBLIC_UNPAYWALL_URL');

// the score is determine by trail and error
const SCORE_THRESHOLD = 0.0005;

const mapLocations = locations =>
    locations?.map(location => ({
        name: location.repository_institution || upperFirst(location.host_type),
        url: location.url,
    })) || [];

export const getLinksByDoi = async doi => {
    try {
        const result = await submitGetRequest(`${unpaywallUrl}${encodeURIComponent(doi)}?email=${env('NEXT_PUBLIC_UNPAYWALL_EMAIL')}`);
        return mapLocations(result?.oa_locations);
    } catch (e) {
        console.log(e);
        return [];
    }
};

export const getLinksByTitle = async title => {
    try {
        const result = await submitGetRequest(`${unpaywallUrl}search?query=${encodeURIComponent(title)}&email=${env('NEXT_PUBLIC_UNPAYWALL_EMAIL')}`);
        return mapLocations(result.results?.find(_result => _result.score > SCORE_THRESHOLD)?.response?.oa_locations);
    } catch (e) {
        console.log(e);
        return [];
    }
};
