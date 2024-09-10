import { env } from 'next-runtime-env';
import { submitGetRequest } from 'network';
import { OptionType, ExternalServiceResponse } from 'components/Autocomplete/types';
import { AUTOCOMPLETE_SOURCE } from 'constants/autocompleteSources';

export const wikidataUrl = env('NEXT_PUBLIC_WIKIDATA_URL');
export const wikidataSparql = env('NEXT_PUBLIC_WIKIDATA_SPARQL');

export const searchEntity = async ({
    value,
    page,
    pageSize,
    type = 'item',
}: {
    value: string;
    page: number;
    pageSize: number;
    type?: string;
}): Promise<ExternalServiceResponse> => {
    if (!type) {
        return { options: [], hasMore: false };
    }
    const newOptions = [];

    const results = await submitGetRequest(
        `${wikidataUrl}?action=wbsearchentities&search=${encodeURIComponent(value)}&limit=${pageSize}&continue=${
            page * pageSize
        }&type=${type}&language=en&format=json&origin=*`,
    );
    if (results && results.search) {
        for (const [index, result] of results.search.entries()) {
            // a simple heuristic to determine if something should get the "Recommended" label
            const isRecommended =
                index === 0 &&
                page === 0 &&
                (result.label?.toLowerCase() === value?.toLowerCase() ||
                    !!result.aliases?.find((alias: string) => alias?.toLowerCase() === value?.toLowerCase()));

            const item: OptionType = {
                id: result.id,
                label: result.label,
                description: result.description,
                external: true,
                source: AUTOCOMPLETE_SOURCE.WIKIDATA,
                ontology: 'Wikidata',
                statements: [],
                tooltipData: [],
                isRecommended,
                uri: `https://www.wikidata.org/entity/${result.id}`,
            };
            newOptions.push(item);
        }
    }

    return { options: newOptions, hasMore: results ? !!results['search-continue'] : false };
};

export const searchAuthorOnWikidataByORCID = (orcid: string) => {
    const query = `SELECT ?item ?itemLabel ?dblpId WHERE {
                    ?item wdt:P496 "${orcid}" ;
                        wdt:P2456 ?dblpId .
                    SERVICE wikibase:label {
                        bd:serviceParam wikibase:language "en" .
                    }
        }`;

    return submitGetRequest(`${wikidataSparql}?query=${encodeURIComponent(query)}&format=json`);
};
