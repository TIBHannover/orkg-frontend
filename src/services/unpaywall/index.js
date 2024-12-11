import ky from 'ky';
import { upperFirst } from 'lodash';
import { env } from 'next-runtime-env';

export const unpaywallUrl = env('NEXT_PUBLIC_UNPAYWALL_URL');
const unpaywallApi = ky.create({ prefixUrl: unpaywallUrl });

// the score is determine by trail and error
const SCORE_THRESHOLD = 0.0005;

const mapLocations = (locations) =>
    locations?.map((location) => ({
        name: location.repository_institution || upperFirst(location.host_type),
        url: location.url,
    })) || [];

export const getLinksByDoi = async (doi) => {
    try {
        const result = await unpaywallApi
            .get(`${encodeURIComponent(doi)}`, {
                searchParams: `email=${env('NEXT_PUBLIC_UNPAYWALL_EMAIL')}`,
            })
            .json();
        return mapLocations(result?.oa_locations);
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const getLinksByTitle = async (title) => {
    try {
        const result = await unpaywallApi
            .get('search', {
                searchParams: `query=${encodeURIComponent(title)}&email=${env('NEXT_PUBLIC_UNPAYWALL_EMAIL')}`,
            })
            .json();
        return mapLocations(result.results?.find((_result) => _result.score > SCORE_THRESHOLD)?.response?.oa_locations);
    } catch (e) {
        console.error(e);
        return [];
    }
};
