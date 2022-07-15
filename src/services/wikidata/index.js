import env from '@beam-australia/react-env';
import { submitGetRequest } from 'network';

export const wikidataUrl = env('WIKIDATA_URL');

export const searchEntity = async ({ value, page, pageSize, type }) => {
    if (!type) {
        return { options: [], hasMore: false };
    }
    const newOptions = [];

    const results = await submitGetRequest(
        `${wikidataUrl}?action=wbsearchentities&search=${encodeURIComponent(value)}&limit=${pageSize}&continue=${page *
            pageSize}&type=${type}&language=en&format=json&origin=*`,
    );

    for (const [index, result] of results.search.entries()) {
        // a simple heuristic to determine if something should get the "Recommended" label
        const isRecommended =
            index === 0 &&
            page === 0 &&
            (result.label?.toLowerCase() === value?.toLowerCase() || !!result.aliases?.find(alias => alias?.toLowerCase() === value?.toLowerCase()));

        const item = {
            id: result.id,
            label: result.label,
            description: result.description,
            external: true,
            source: 'wikidata-api',
            ontology: 'Wikidata',
            statements: [],
            tooltipData: [],
            isRecommended,
            uri: result.url,
        };
        newOptions.push(item);
    }

    return { options: newOptions, hasMore: !!results['search-continue'] };
};
